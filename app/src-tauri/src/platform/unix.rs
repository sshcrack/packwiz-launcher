use std::path::{Path, PathBuf};

pub async fn create_shortcut(
    _prism_exec: &Path,
    _instance_name: &str,
    _config_name: &str,
    _shortcut_icon: &Path,
) -> Result<(), anyhow::Error> {
    log::warn!("Shortcut creation is not supported on this platform.");
    Ok(())
}

pub fn get_prism_launcher_exec() -> Result<Option<PathBuf>, String> {
    log::warn!("PrismLauncher executable detection is not supported on this platform.");
    Ok(None)
}

pub fn get_prism_launcher_data() -> Result<Option<PathBuf>, String> {
    get_prism_launcher_exec()?
        .map(|e| e.parent().map(|p| p.to_path_buf()))
        .ok_or_else(|| {
            log::warn!("PrismLauncher executable not found, returning None for data directory.");

            "PrismLauncher executable not found".to_string()
        })
}
