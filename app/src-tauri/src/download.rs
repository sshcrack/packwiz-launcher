use std::path::Path;

use anyhow::Context;
use async_stream::stream;
use futures_core::Stream;
use futures_util::StreamExt;
use sha2::{Digest, Sha256};
use tokio::{fs::File, io::AsyncWriteExt};

use crate::github_releases;

pub(super) enum DownloadStatus {
    Error(anyhow::Error),
    Progress(f32, String)
}



pub(super) async fn download<T: AsRef<Path>, K>(
    repo: &str,
    is_valid_file: K,
    path: T,
    hash_url: Option<String>,
) -> anyhow::Result<impl Stream<Item = DownloadStatus>>
where
    K: Fn(&str) -> bool
{
    let display_name = repo.split('/').last().unwrap_or("unknown");

    let client = reqwest::ClientBuilder::new()
        .user_agent("Packwiz-Installer")
        .build()?;

    let releases: github_releases::Root = client
        .get(format!("https://api.github.com/repos/{repo}/releases"))
        .send()
        .await?
        .json()
        .await?;

    let latest_version = releases
        .iter()
        .max_by_key(|r| &r.published_at)
        .context("Finding latest version")?;

    let archive_url = latest_version
        .assets
        .iter()
        .find(|a| is_valid_file(&a.name))
        .context("Finding 7z asset")?
        .browser_download_url
        .clone();

    let display_name = display_name.to_string();

    let res = client.get(archive_url).send().await?;
    let length = res.content_length().unwrap_or(0);

    let mut bytes_stream = res.bytes_stream();

    let mut tmp_file = File::create_new(&path)
        .await
        .context("Creating temporary file")?;
    let mut curr_len = 0;

    let mut hasher = Sha256::new();
    Ok(stream! {
        yield DownloadStatus::Progress(0.0, format!("Downloading {display_name}"));
        while let Some(chunk) = bytes_stream.next().await {
            let chunk = chunk.context("Retrieving data from stream");
            if let Err(e) = chunk {
                yield DownloadStatus::Error(e);
                return;
            }

            let chunk = chunk.unwrap();
            hasher.update(&chunk);
            let r = tmp_file.write_all(&chunk).await.context("Writing to temporary file");
            if let Err(e) = r {
                yield DownloadStatus::Error(e);
                return;
            }

            curr_len = std::cmp::min(curr_len + chunk.len() as u64, length);
            yield DownloadStatus::Progress(curr_len as  f32 / length as f32, format!("Downloading {display_name}"));
        }

        if let Some(hash_url) = hash_url {
             // Getting remote hash
            let remote_hash = client.get(hash_url).send().await.context("Fetching hash");
            if let Err(e) = remote_hash {
                yield DownloadStatus::Error(e);
                return;
            }

            let remote_hash = remote_hash.unwrap().text().await.context("Reading hash");
            if let Err(e) = remote_hash {
                yield DownloadStatus::Error(e);
                return;
            }

            let remote_hash = remote_hash.unwrap();
            let remote_hash = hex::decode(remote_hash.trim()).context("Decoding hash");
            if let Err(e) = remote_hash {
                yield DownloadStatus::Error(e);
                return;
            }

            let remote_hash = remote_hash.unwrap();

            // Calculating local hash
            let local_hash = hasher.finalize();
            if local_hash.as_slice() != remote_hash {
                yield DownloadStatus::Error(anyhow::anyhow!("Hash mismatch"));
                return;
            }

            log::info!("Hashes match");
        }
    })
}
