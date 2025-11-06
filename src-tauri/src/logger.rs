use serde::{Deserialize};
use tauri::{command};


#[derive(Deserialize)]
pub enum FrontendLogLevel {
    Trace,
    Debug,
    Info,
    Warn,
    Error,
}

#[command]
pub fn frontend_log(level: FrontendLogLevel, message: String) {
    match level {
        FrontendLogLevel::Trace => log::trace!(target: "frontend", "{}", message),
        FrontendLogLevel::Debug => log::debug!(target: "frontend", "{}", message),
        FrontendLogLevel::Info  => log::info!(target: "frontend", "{}", message),
        FrontendLogLevel::Warn  => log::warn!(target: "frontend", "{}", message),
        FrontendLogLevel::Error => log::error!(target: "frontend", "{}", message),
    }
}
