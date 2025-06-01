use std::path::Path;
use std::process::Command;

use async_stream::stream;
use configparser::ini::Ini;
use configparser::ini::WriteOptions;
use download_extract_progress::{download, extract_zip};
use futures_core::Stream;
use futures_util::pin_mut;
use futures_util::StreamExt;
use image::ImageReader;
use tokio::fs;
use url::Url;
use uuid::Uuid;

use crate::deletion_guard::TemporaryFileCleaner;
use crate::platform::create_shortcut;
use crate::util;

pub fn install_modpack(
    prism_data: &Path,
    prism_exec: &Path,
) -> impl Stream<Item = Result<(f32, String), anyhow::Error>> {
    let prism_data = prism_data.to_owned();
    let prism_exec = prism_exec.to_owned();
    stream! {
        log::info!("Starting modpack installation");
        yield Ok((0.0, "Importing instance".to_string()));

        let config = util::read_metadata()
            .map_err(|e| anyhow::anyhow!("Failed to get modpack config: {}", e));
        if let Err(e) = config {
            log::error!("Failed to get modpack config: {}", e);
            yield Err(e);
            return;
        }

        let config = config.unwrap();
        log::info!("Using modpack config with base URL: {}", config.base_pack_url);

        let instances_dir = prism_data.join("instances");
        let mut instance_dir = instances_dir.join(&config.name);
        if instance_dir.exists() {
            let mut found = false;
            for i in 0..50 {
                let new_instance_dir = instance_dir.with_file_name(format!("{} ({})", config.name, i));
                if !new_instance_dir.exists() {
                    instance_dir = new_instance_dir;
                    found = true;
                    break;
                }
            }

            if !found {
                log::error!("Failed to find a unique instance directory name for {}", config.name);
                yield Err(anyhow::anyhow!("Failed to find a unique instance directory name for {}", config.name));
                return;
            }
        }

        let tmp_file = TemporaryFileCleaner::new();
        let download_str = download(
            format!("Modpack: {}", config.name).as_str(),
            &config.base_pack_url,
            tmp_file.file_path(),
            None
        ).await;

        pin_mut!(download_str);
        while let Some(res) = download_str.next().await {
            if let Err(e) = res {
                log::error!("Error downloading modpack: {}", e);
                yield Err(anyhow::anyhow!("Error downloading modpack: {}", e));
                return;
            }

            let (percentage, msg) = res.unwrap();
            yield Ok((percentage / 3.0, msg));
        }

        let extract_str = extract_zip(
            &tmp_file.file_path(),
            &instance_dir
        ).await;

        pin_mut!(extract_str);
        while let Some(res) = extract_str.next().await {
            if let Err(e) = res {
                log::error!("Error extracting modpack: {}", e);
                yield Err(anyhow::anyhow!("Error extracting modpack: {}", e));
                return;
            }

            let (percentage, msg) = res.unwrap();
            yield Ok((0.333 + percentage / 3.0, msg));
        }

        // Downloading packwiz and setting custom commands
        let mc_folder = instance_dir.join("minecraft");
        let packwiz_jar = mc_folder.join("packwiz_bootstrap.jar");
        if !mc_folder.exists() {
            if let Err(e) = fs::create_dir_all(&mc_folder).await {
                log::error!("Failed to create minecraft directory: {}", e);
                yield Err(anyhow::anyhow!("Failed to create minecraft directory: {}", e));
                return;
            }
        }

        let write_packwiz = fs::write(&packwiz_jar, include_bytes!("./packwiz_bootstrap.jar"))
            .await
            .map_err(|e| {
                log::error!("Failed to write packwiz bootstrap jar: {}", e);
                anyhow::anyhow!("Failed to write packwiz bootstrap jar: {}", e)
            });

        if let Err(e) = write_packwiz {
            log::error!("Failed to write packwiz: {}", e);
            yield Err(anyhow::anyhow!("Failed to write packwiz: {}", e));
            return;
        }

        let prism_cfg_path = instance_dir.join("instance.cfg");
        let mut prism_config = Ini::new_cs();
        let map = prism_config.load(&prism_cfg_path);
        if let Err(e) = map {
            log::error!("Failed to load instance config: {}", e);
            yield Err(anyhow::anyhow!("Failed to load instance config: {}", e));
            return;
        }

        let cmd = format!(
            "$INST_JAVA -jar packwiz_bootstrap.jar {}",
            config.packwiz_url
        );

        log::info!("Setting pre-launch command: '{}'", cmd);
        prism_config.set("General", "PreLaunchCommand", Some(cmd));
        prism_config.set("General", "OverrideCommands", Some("true".to_string()));
        prism_config.set("General", "name", Some(config.name.clone()));

        let parsed_url = Url::parse(&config.logo_url)
            .map_err(|e| {
                log::error!("Failed to parse logo URL: {}", e);
                anyhow::anyhow!("Failed to parse logo URL: {}", e)
            });
        if let Err(e) = parsed_url {
            log::error!("Failed to parse logo URL: {}", e);
            yield Err(e);
            return;
        }

        let parsed_url = parsed_url.unwrap();
        let file_name = parsed_url
            .path_segments()
            .and_then(|segments| segments.last())
            .ok_or_else(|| anyhow::anyhow!("Failed to get file name from logo URL"));
        if let Err(e) = file_name {
            log::error!("Failed to get file name from logo URL: {}", e);
            yield Err(e);
            return;
        }

        let file_name = file_name.unwrap();
        let icon_orig_ext = file_name
            .rsplit('.')
            .next()
            .ok_or_else(|| anyhow::anyhow!("Failed to get file extension from logo URL"));
        if let Err(e) = icon_orig_ext {
            log::error!("Failed to get file extension from logo URL: {}", e);
            yield Err(e);
            return;
        }

        let icon_orig_ext = icon_orig_ext.unwrap();
        let tmp_ico = TemporaryFileCleaner::new_with_extension(icon_orig_ext);

        let icon_uuid  = Uuid::new_v4().to_string();
        let icon_path = prism_data.join("icons").join(format!("{icon_uuid}.png"));
        if !icon_path.parent().unwrap().exists() {
            if let Err(e) = fs::create_dir_all(icon_path.parent().unwrap()).await {
                log::error!("Failed to create icons directory: {}", e);
                yield Err(anyhow::anyhow!("Failed to create icons directory: {}", e));
                return;
            }
        }

        let icon_str = download(
            format!("Modpack Icon: {}", config.name).as_str(),
            &config.logo_url,
            tmp_ico.file_path(),
            None
        ).await;

        pin_mut!(icon_str);
        while let Some(res) = icon_str.next().await {
            if let Err(e) = res {
                log::error!("Error downloading modpack icon: {}", e);
                yield Err(anyhow::anyhow!("Error downloading modpack icon: {}", e));
                return;
            }

            let (percentage, msg) = res.unwrap();
            yield Ok((0.666 + percentage / 3.0, msg));
        }

        let icon = ImageReader::open(tmp_ico.file_path())
            .map_err(|e| {
                log::error!("Failed to open icon image: {}", e);
                anyhow::anyhow!("Failed to open icon image: {}", e)
            });
        if let Err(e) = icon {
            log::error!("Failed to open icon image: {}", e);
            yield Err(e);
            return;
        }

        let icon = icon.unwrap().decode().map_err(|e| {
            log::error!("Failed to decode icon image: {}", e);
            anyhow::anyhow!("Failed to decode icon image: {}", e)
        });
        if let Err(e) = icon {
            log::error!("Failed to decode icon image: {}", e);
            yield Err(e);
            return;
        }

        let icon = icon.unwrap();
        let res = icon.save(&icon_path)
            .map_err(|e| {
                log::error!("Failed to save icon image at {}: {}", e, icon_path.display());
                anyhow::anyhow!("Failed to save icon image: {}", e)
            });

        let shortcut_icon = icon_path.with_extension("ico");
        if !shortcut_icon.exists() {
            if let Err(e) = icon.save(&shortcut_icon) {
                log::error!("Failed to save icon as ICO: {}", e);
                yield Err(anyhow::anyhow!("Failed to save icon as ICO: {}", e));
                return;
            }
            log::info!("Saved icon as ICO: {:?}", shortcut_icon);
        } else {
            log::info!("ICO icon already exists: {:?}", shortcut_icon);
        }

        if let Err(e) = res {
            log::error!("Failed to save icon image: {}", e);
            yield Err(e);
            return;
        }


        prism_config.set("General", "iconKey", Some(icon_uuid));

        let write_options = WriteOptions::new_with_params(true, 2, 1);
        let save = prism_config.pretty_write(&prism_cfg_path, &write_options);
        if let Err(e) = save {
            log::error!("Failed to save instance config: {}", e);
            yield Err(anyhow::anyhow!("Failed to save instance config: {}", e));
            return;
        }

        let instance_name = instance_dir.file_name()
            .and_then(|f| f.to_str().map(|s| s.to_string()))
            .ok_or_else(|| anyhow::anyhow!("Failed to get instance name from directory"));
        if let Err(e) = instance_name {
            log::error!("Failed to get instance name from directory: {}", e);
            yield Err(e);
            return;
        }

        let instance_name = instance_name.unwrap();
        let res = create_shortcut(&prism_exec, &instance_name, &config.name, &shortcut_icon)
            .await
            .map_err(|e| {
                log::error!("Failed to create shortcut: {}", e);
                anyhow::anyhow!("Failed to create shortcut: {}", e)
            });

        if let Err(e) = res {
            yield Err(e);
            return;
        }

        let res = Command::new(&prism_exec)
            .arg("-l")
            .arg(&instance_name)
            .spawn()
            .map_err(|e| {
                log::error!("Failed to launch Prism Launcher: {}", e);
                anyhow::anyhow!("Failed to launch Prism Launcher: {}", e)
            });

        if let Err(e) = res {
            log::error!("Failed to launch Prism Launcher: {}", e);
            yield Err(e);
            return;
        }

        yield Ok((1.0, "Done importing".to_string()));
    }
}
