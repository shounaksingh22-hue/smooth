use crate::models::system::StartupItem;
use crate::platform::Platform;

pub fn analyze() -> Vec<StartupItem> {
    Platform::startup_items()
}
