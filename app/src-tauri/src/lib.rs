mod deletion_guard;
mod modpack;
mod util;

use deletion_guard::TemporaryFileCleaner;
use download_extract_progress::{download_github, extract_zip};
use futures_util::{pin_mut, StreamExt};
use modpack::install_modpack;
use tauri::{AppHandle, Emitter};
use tokio::process::Command;
use util::ModpackConfig;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn read_config() -> Result<ModpackConfig, String> {
    util::read_metadata()
}

#[tauri::command]
fn get_prism_launcher_path() -> Result<Option<String>, String> {
    util::get_prism_launcher_exec()
}

#[tauri::command]
async fn install_portable(app: AppHandle, path: &str) -> Result<(), String> {
    // Validate path
    let path = std::path::Path::new(path);
    if !path.exists() {
        return Err("The specified path doesn't exist".into());
    }

    if !path.is_dir() {
        return Err("The specified path is not a directory".into());
    }

    // Emit progress update
    app.emit(
        "install_progress",
        (0.0, "Starting portable installation..."),
    )
    .unwrap();

    // Installing PrismLauncher
    let tmp_file = TemporaryFileCleaner::new();
    let s = download_github(
        "PrismLauncher/PrismLauncher",
        |s| s.to_lowercase().contains("portable") && s.contains("MSVC") && !s.contains("arm64"),
        tmp_file.file_path(),
        None,
    )
    .await;

    if let Err(e) = s {
        return Err(format!("Failed to download PrismLauncher: {}", e));
    }

    let stream = s.unwrap();

    pin_mut!(stream);
    while let Some(res) = stream.next().await {
        let (percentage, msg) =
            res.map_err(|e| format!("Error downloading PrismLauncher: {}", e))?;

        app.emit("install_progress", (percentage / 3.0, msg))
            .unwrap();
    }

    app.emit("install_progress", (0.333, "Extracting PrismLauncher"))
        .unwrap();

    println!(
        "Extracting PrismLauncher to: {}",
        tmp_file.file_path().display()
    );

    // Extracting PrismLauncher
    let extract = extract_zip(tmp_file.file_path(), path).await;
    pin_mut!(extract);

    while let Some(res) = extract.next().await {
        let (percentage, msg) =
            res.map_err(|e| format!("Error extracting PrismLauncher: {}", e))?;

        app.emit("install_progress", (0.333 + percentage / 3.0, msg))
            .unwrap();
    }

    let install = install_modpack(&path.join("prismlauncher.exe"));
    pin_mut!(install);

    while let Some(res) = install.next().await {
        let (percentage, msg) = res.map_err(|e| format!("Error installing modpack: {}", e))?;
        app.emit("install_progress", (0.666 + percentage / 3.0, msg))
            .unwrap();
    }
    Ok(())
}

#[tauri::command]
async fn install_launcher(app: AppHandle, custom_path: Option<String>) -> Result<(), String> {
    let path = custom_path.or(util::get_prism_launcher_exec().ok().flatten());

    log::info!("PrismLauncher path: {:?}", path);
    if path.is_none() {
        let tmp_file = TemporaryFileCleaner::new();
        let s = download_github(
            "PrismLauncher/PrismLauncher",
            |s| s.contains(".exe") && s.contains("MSVC") && !s.contains("arm64"),
            tmp_file.file_path(),
            None,
        )
        .await;

        if let Err(e) = s {
            return Err(format!("Failed to download PrismLauncher: {}", e));
        }

        let stream = s.unwrap();

        pin_mut!(stream);
        while let Some(res) = stream.next().await {
            let (percentage, msg) =
                res.map_err(|e| format!("Error downloading PrismLauncher: {}", e))?;
            app.emit("install_progress", (percentage / 3.0, msg))
                .unwrap();
        }

        app.emit("install_progress", (0.333, "Installing PrismLauncher"))
            .unwrap();

        let out = Command::new(&tmp_file.file_path())
            .output()
            .await
            .map_err(|e| format!("Failed to run PrismLauncher installer: {}", e))?;

        let status = out.status;
        if !status.success() {
            return Err(format!(
                "PrismLauncher installer exited with code: {}",
                status.code().unwrap_or(-1)
            ));
        }

        app.emit("install_progress", (0.666, "Installing modpack..."))
            .unwrap();
    }

    let path = path.or(util::get_prism_launcher_exec().ok().flatten());
    if path.is_none() {
        return Err("PrismLauncher installation canceled.".into());
    }

    let path = path.unwrap();
    let path = std::path::Path::new(&path);

    let install = install_modpack(path);
    pin_mut!(install);

    while let Some(res) = install.next().await {
        let (percentage, msg) = res.map_err(|e| format!("Error installing modpack: {}", e))?;
        app.emit("install_progress", (0.666 + percentage / 3.0, msg))
            .unwrap();
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::LogDir {
                        file_name: Some("logs".to_string()),
                    },
                ))
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            read_config,
            get_prism_launcher_path,
            install_launcher,
            install_portable
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
