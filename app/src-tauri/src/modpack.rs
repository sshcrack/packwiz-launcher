use std::path::Path;

use async_stream::stream;
use configparser::ini::Ini;
use configparser::ini::WriteOptions;
use directories::BaseDirs;
use directories::UserDirs;
use download_extract_progress::{download, extract_zip};
use futures_core::Stream;
use futures_util::pin_mut;
use futures_util::StreamExt;
use image::ImageReader;
use mslnk::ShellLink;
use tokio::fs;
use tokio::process::Command;
use url::Url;
use uuid::Uuid;

use crate::deletion_guard::TemporaryFileCleaner;
use crate::util;

async fn create_shortcut(
    prism_exec: &Path,
    instance_dir: &Path,
    config_name: &str,
    shortcut_icon: &Path,
) -> Result<(), anyhow::Error> {
    let instance_id = instance_dir
        .file_name()
        .and_then(|f| f.to_str())
        .ok_or_else(|| anyhow::anyhow!("Failed to get instance directory name"))?;

    let mut lnk = ShellLink::new(prism_exec)?;
    lnk.set_arguments(Some(format!("-l \"{}\"", instance_id)));
    lnk.set_icon_location(Some(shortcut_icon.to_string_lossy().to_string()));

    if let Some(user_dirs) = UserDirs::new() {
        if let Some(desktop_dir) = user_dirs.desktop_dir() {
            lnk.create_lnk(desktop_dir.join(format!("{}.lnk", config_name)))?;
            log::info!("Created shortcut on desktop: {:?}", desktop_dir);
        } else {
            log::warn!("No desktop directory found, skipping link creation");
        }
    }

    if let Some(base_dirs) = BaseDirs::new() {
        let app_data = base_dirs
            .data_dir()
            .join("Microsoft/Windows/Start Menu/Programs");
        lnk.create_lnk(app_data.join(format!("{}.lnk", config_name)))?;
        log::info!("Created shortcut in app data: {:?}", app_data);
    }

    Ok(())
}

pub fn install_modpack(
    prism_exec: &Path,
) -> impl Stream<Item = Result<(f32, String), anyhow::Error>> {
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

        let parent_path = prism_exec.parent()
            .ok_or_else(|| anyhow::anyhow!("Failed to get parent directory of Prism Launcher path"));

        if let Err(e) = parent_path {
            log::error!("Failed to get log path: {}", e);
            yield Err(e);
            return;
        }

        let parent_path = parent_path.unwrap();
        let instances_dir = parent_path.join("instances");

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
        let icon_path = parent_path.join("icons").join(format!("{icon_uuid}.png"));
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

        log::info!("Saved instance config to: {}", prism_cfg_path.display());
        let res = create_shortcut(&prism_exec, &instance_dir, &config.name, &shortcut_icon)
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
            .arg(&config.name)
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
