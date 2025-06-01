// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(not(target_os = "windows"))]
compile_error!("Only Windows is supported for now");

fn main() {
    modpack_installer_lib::run()
}
