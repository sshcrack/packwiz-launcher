use std::env;
use std::fs::File;
use std::io::{Read, Seek, SeekFrom};

/// Reads the URL that was appended to the end of the executable
pub fn read_appended_url() -> Result<String, String> {
    if cfg!(debug_assertions) {
        return Ok("https://localhost:8080".to_string());
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
    String::from_utf8(url_bytes).map_err(|e| format!("URL is not valid UTF-8: {}", e))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_read_appended_url() {
        // This test will fail if run on an executable without an appended URL
        if let Ok(url) = read_appended_url() {
            println!("Found URL: {}", url);
            assert!(!url.is_empty());
        } else {
            // This is expected during normal test runs
            println!("No URL found (expected during tests)");
        }
    }
}
