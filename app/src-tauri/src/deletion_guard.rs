use std::path::PathBuf;

pub struct TemporaryFileCleaner {
    file: PathBuf,
}

impl TemporaryFileCleaner {
    pub fn new_with_extension(extension: &str) -> Self {
        let tmp_dir = std::env::temp_dir();
        let file_name = format!("tempfile-{}.{}", uuid::Uuid::new_v4(), extension);
        let file = tmp_dir.join(file_name);

        Self { file }
    }

    pub fn new() -> Self {
        Self::new_with_extension("tmp")
    }

    pub fn file_path(&self) -> &PathBuf {
        &self.file
    }
}

impl Drop for TemporaryFileCleaner {
    fn drop(&mut self) {
        if !self.file.exists() {
            log::debug!(
                "Temporary file {} does not exist, no need to delete.",
                self.file.display()
            );
            return;
        }

        if let Err(e) = std::fs::remove_file(&self.file) {
            log::debug!(
                "Failed to delete temporary file {}: {}",
                self.file.display(),
                e
            );
        } else {
            log::trace!("Deleted temporary file: {}", self.file.display());
        }
    }
}
