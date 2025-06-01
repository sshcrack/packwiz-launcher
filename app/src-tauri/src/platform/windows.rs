use directories::{BaseDirs, UserDirs};
use mslnk::ShellLink;
use registry::{Hive, Security};
use std::path::{Path, PathBuf};

pub async fn create_shortcut(
    prism_exec: &Path,
    instance_name: &str,
    config_name: &str,
    shortcut_icon: &Path,
) -> Result<(), anyhow::Error> {
    let mut lnk = ShellLink::new(prism_exec)?;
    lnk.set_arguments(Some(format!("-l \"{}\"", instance_name)));
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

pub fn get_prism_launcher_exec() -> Result<Option<PathBuf>, String> {
    let key = Hive::ClassesRoot
        .open(r"prismlauncher\shell\open\command", Security::Read)
        .ok();

    if key.is_none() {
        return Ok(None);
    }

    let key = key.unwrap();
    let val = key.values().next();

    if val.is_none() {
        return Ok(None);
    }

    let val = val.unwrap().ok();
    if val.is_none() {
        return Ok(None);
    }

    let val = val.unwrap();
    let val = val.data();
    let val = val.to_string();
    let val = val.split('"').collect::<Vec<_>>();

    if val.len() < 2 {
        return Ok(None);
    }

    let val = val[1].to_string();
    if val.is_empty() {
        return Ok(None);
    }

    Ok(Some(PathBuf::from(val)))
}

pub fn get_prism_launcher_data() -> Result<Option<PathBuf>, String> {
    get_prism_launcher_exec()?
        .map(|e| e.parent().map(|p| p.to_path_buf()))
        .ok_or_else(|| {
            log::warn!("PrismLauncher executable not found, returning None for data directory.");

            "PrismLauncher executable not found".to_string()
        })
}
