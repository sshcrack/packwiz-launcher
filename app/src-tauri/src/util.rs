use std::env;
use std::fs::File;
use std::io::{Read, Seek, SeekFrom};

use registry::{Hive, Security};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct ModpackConfig {
    pub name: String,
    pub author: String,
    pub description: String,
    pub logo_url: String,
    pub packwiz_url: String,
    pub base_pack_url: String,
    pub theme: String,
    pub background: String,
}

/// Reads the URL that was appended to the end of the executable
pub fn read_metadata() -> Result<ModpackConfig, String> {
    if cfg!(debug_assertions) {
        return Ok(ModpackConfig {
            name: "Minecolonies".to_string(),
            author: "sshcrack".to_string(),
            description: "A modpack focused on building and managing colonies with the Minecolonies mod. Includes various quality of life mods and performance improvements.".to_string(),
            logo_url: "https://discord.do/wp-content/uploads/2023/08/MineColonies.jpg".to_string(),
            base_pack_url: "http://localhost:3001/base_modpack.zip".to_string(),
            packwiz_url: "http://localhost:3000".to_string(),
            theme: "dark".to_string(),
            background: "deepslate".to_string()
        });
    }

    // Get the path to the current executable
    let exe_path =
        env::current_exe().map_err(|e| format!("Failed to get executable path: {}", e))?;

    let mut file = File::open(exe_path).map_err(|e| format!("Failed to open executable: {}", e))?;

    // Get the file size
    let file_size = file
        .metadata()
        .map_err(|e| format!("Failed to read file metadata: {}", e))?
        .len();

    // First read the last 8 bytes which contain the URL length
    if file_size < 8 {
        return Err("Executable file is too small".to_string());
    }

    // Move to position where URL length is stored (last 8 bytes)
    file.seek(SeekFrom::End(-8))
        .map_err(|e| format!("Failed to seek to URL length: {}", e))?;

    // Read the URL length (u64, 8 bytes)
    let mut length_bytes = [0u8; 8];
    file.read_exact(&mut length_bytes)
        .map_err(|e| format!("Failed to read URL length: {}", e))?;

    // Convert bytes to u64
    let url_length = u64::from_le_bytes(length_bytes);

    // Validate URL length
    if url_length == 0 || url_length > file_size - 8 {
        return Err(format!("Invalid URL length: {}", url_length));
    }

    // Move to position where URL starts
    file.seek(SeekFrom::End(-8 - (url_length as i64)))
        .map_err(|e| format!("Failed to seek to URL: {}", e))?;

    let url_length =
        usize::try_from(url_length).map_err(|e| format!("Failed to convert URL length: {}", e))?;

    // Read the URL
    let mut url_bytes = vec![0u8; url_length];
    file.read_exact(&mut url_bytes)
        .map_err(|e| format!("Failed to read URL: {}", e))?;

    // Convert bytes to String
    let raw_str =
        String::from_utf8(url_bytes).map_err(|e| format!("URL is not valid UTF-8: {}", e))?;

    serde_json::from_str(&raw_str)
        .map_err(|e| format!("Failed to parse URL as JSON: {}", e))
        .map(|config: ModpackConfig| config)
}

pub fn get_prism_launcher_exec() -> Result<Option<String>, String> {
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

    Ok(Some(val))
}
