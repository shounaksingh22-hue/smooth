# SSmooth

> Make your machine feel new again. Free, offline, and fully transparent.

<p align="center">
  <strong>Free</strong> · no account, no payment, no ads<br>
  <strong>Offline</strong> · nothing ever leaves your machine<br>
  <strong>Transparent</strong> · you approve every action<br>
  <strong>Reversible</strong> · items go to the Trash, not permanent deletion
</p>

---

## What is SSmooth?

SSmooth is a free, open source desktop app that analyzes your Mac or Windows machine, explains what is slowing it down, and, only after you approve, safely cleans it up. It runs entirely on your device with no network calls in its core paths.

It is built around one idea: tell the truth about the machine, then let the person decide.

### What it does

1. **Analyzes** your system, read only, with no changes:
   - Hardware and OS (CPU, RAM, disk type, OS version)
   - Storage breakdown (caches, applications, documents, media)
   - Live memory pressure and the heaviest processes
   - Startup and login items

2. **Diagnoses** the likely causes of slowness, ranked by impact, each with a plain language explanation, an estimated gain, and a risk label.

3. **Cleans** only what you approve:
   - Per item and per category toggles
   - A dry run preview before anything happens
   - Items move to the Trash or Recycle Bin by default
   - A full action log written to disk

4. **Reports** the before and after, with the space you reclaimed.

5. **Recommends a maintenance plan**, personalized from your own scan. Every tip is tied to a real measurement (for example, on a machine with 8 GB of RAM running two browsers, it suggests using one at a time). If nothing needs attention, it says so instead of inventing problems.

### What it will not do

- Never deletes your files (Documents, Desktop, Pictures, and the like)
- Never touches system critical paths
- Never runs anything without your explicit click
- Never makes network calls for analysis or cleanup
- Never collects telemetry or analytics

---

## Design

SSmooth uses a single, calm design language inspired by Apple and Teenage Engineering: neutral surfaces, generous whitespace, one accent color, monospace micro labels, and tactile controls. Light and dark themes both cover the entire interface, switchable from the top right.

---

## Installation

### macOS

1. Download `SSmooth_x.x.x_aarch64.dmg` (Apple Silicon) or `SSmooth_x.x.x_x64.dmg` (Intel) from [Releases](https://github.com/shounaksingh22-hue/smooth/releases).
2. Open the `.dmg` and drag **SSmooth** to Applications.
3. On first launch, right click the app and choose Open to bypass Gatekeeper (the app is not yet code signed).

> Verify your download: each release publishes SHA-256 checksums.
> ```bash
> shasum -a 256 SSmooth_*.dmg
> ```

### Windows

1. Download `SSmooth_x.x.x_x64-setup.exe` or `SSmooth_x.x.x_x64_en-US.msi` from [Releases](https://github.com/shounaksingh22-hue/smooth/releases).
2. Run the installer and follow the prompts.
3. Launch **SSmooth** from the Start Menu.

> Verify your download:
> ```powershell
> Get-FileHash SSmooth_*-setup.exe -Algorithm SHA256
> ```

---

## Building from source

### Prerequisites

- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) 20+
- macOS: Xcode Command Line Tools (`xcode-select --install`)
- Windows: Visual Studio Build Tools with the "Desktop development with C++" workload

### Develop

```bash
git clone https://github.com/shounaksingh22-hue/smooth.git
cd smooth
npm install
npm run tauri dev
```

### Build

```bash
npm run tauri build
# macOS:   src-tauri/target/release/bundle/dmg/SSmooth_*.dmg
# Windows: src-tauri/target/release/bundle/nsis/SSmooth_*-setup.exe
```

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | [Tauri v2](https://tauri.app/) |
| Backend | Rust |
| Frontend | React + TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Charts | Recharts |
| Icons | Lucide React |

Continuous integration builds and tests the app on macOS (Apple Silicon and Intel) and Windows for every push, so a broken build never reaches a release.

---

## Privacy and safety

- Zero network calls in the core analysis and cleanup paths
- No telemetry, no analytics, no crash reporting
- No accounts, no sign ups, no payments
- All processing happens locally
- A hardcoded blocklist prevents touching user data and system paths
- An action log is written to disk for full transparency
- Open source, so you can read every line

---

## License

[MIT](LICENSE). Free and open source.

Built by Shounak Singh.

---

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am "Add my feature"`)
4. Push the branch (`git push origin feature/my-feature`)
5. Open a pull request
