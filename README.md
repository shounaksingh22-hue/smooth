# Smooth

> Make your machine fast again — for free, offline, and with full transparency.

<p align="center">
  <strong>🚀 Free</strong> · No account, no payment, no ads<br>
  <strong>🔒 Offline</strong> · No data ever leaves your machine<br>
  <strong>👁️ Transparent</strong> · You approve every single action<br>
  <strong>↩️ Reversible</strong> · Files go to Trash, not permanently deleted
</p>

---

## What is Smooth?

Smooth is a free, open-source desktop application that analyzes your Mac or Windows machine, diagnoses what's slowing it down, and — only after you approve each action — safely cleans things up. It runs entirely on your machine with zero network calls for its core function.

### What it does

1. **Analyzes** your system (read-only, no changes):
   - Hardware & OS info (CPU, RAM, disk type, OS version)
   - Storage breakdown (caches, temp files, dev junk, trash)
   - Memory pressure and top processes
   - Startup/login items

2. **Diagnoses** likely causes of slowness, ranked by impact

3. **Suggests** fixes with clear explanations:
   - What each action does and why it's safe
   - Estimated space/performance gain
   - Risk labels (Safe / Review / Needs Confirmation)

4. **Executes** only what you approve:
   - Per-item toggles — approve individually or by category
   - Dry-run preview before running
   - Actions prefer Trash over permanent deletion
   - Full action log saved to disk

5. **Reports** before/after results with space recovered

### What it won't do

- ❌ Never deletes user files (Documents, Desktop, Pictures, etc.)
- ❌ Never touches system-critical paths
- ❌ Never runs anything without your explicit click
- ❌ Never makes network calls for analysis or cleanup
- ❌ Never collects telemetry or analytics

---

## Installation

### macOS

1. Download `Smooth_x.x.x_aarch64.dmg` (Apple Silicon) or `Smooth_x.x.x_x64.dmg` (Intel) from [GitHub Releases](https://github.com/user/smooth/releases)
2. Open the `.dmg` and drag **Smooth** to your Applications folder
3. On first launch, right-click → Open (to bypass Gatekeeper for unsigned apps)

> **Verify your download:** Each release includes SHA-256 checksums. Compare with:
> ```bash
> shasum -a 256 Smooth_*.dmg
> ```

### Windows

1. Download `Smooth_x.x.x_x64-setup.exe` (NSIS) or `Smooth_x.x.x_x64_en-US.msi` from [GitHub Releases](https://github.com/user/smooth/releases)
2. Run the installer and follow the prompts
3. Launch **Smooth** from the Start Menu or Desktop shortcut

> **Verify your download:** Each release includes SHA-256 checksums. Compare with:
> ```powershell
> Get-FileHash Smooth_*-setup.exe -Algorithm SHA256
> ```

### Security Note

It's good practice to scan any downloaded application. You can:
- Verify the release checksum against the one published in the GitHub release notes
- Upload the installer to [VirusTotal](https://www.virustotal.com/) for scanning
- Run your own antivirus scan

---

## Building from Source

### Prerequisites

- [Rust](https://rustup.rs/) (stable toolchain)
- [Node.js](https://nodejs.org/) 20+
- **macOS:** Xcode Command Line Tools (`xcode-select --install`)
- **Windows:** Visual Studio Build Tools with "Desktop development with C++" workload

### Development

```bash
# Clone the repository
git clone https://github.com/user/smooth.git
cd smooth

# Install frontend dependencies
npm install

# Run in development mode (hot reload)
npm run tauri dev
```

### Production Build

**macOS:**
```bash
npm run tauri build
# Output: src-tauri/target/release/bundle/dmg/Smooth_*.dmg
```

**Windows:**
```powershell
npm run tauri build
# Output: src-tauri\target\release\bundle\nsis\Smooth_*-setup.exe
#         src-tauri\target\release\bundle\msi\Smooth_*.msi
```

---

## Optional: Local AI Assistant

Smooth can optionally use a local [Ollama](https://ollama.ai/) instance to rephrase technical explanations in simpler language. This feature:

- Requires Ollama running locally on your machine
- Makes only `localhost` connections (never reaches the internet)
- Is completely optional — the core diagnosis works without it
- Can be enabled in Settings

> **Status:** Coming in v2. The current release uses deterministic, rule-based explanations.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Tauri v2](https://tauri.app/) |
| Backend | Rust |
| Frontend | React + TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |

---

## Privacy & Security Model

- **Zero network calls** in core analysis and cleanup paths
- **No telemetry**, no analytics, no crash reporting
- **No accounts**, no sign-ups, no payments
- **All processing** happens locally on your machine
- **Open source** — read every line of code
- **Hardcoded blocklist** prevents touching user data and system files
- **Action log** written to disk for full transparency

---

## License

[MIT](LICENSE) — Free and open source.

---

## Contributing

Contributions are welcome! Please open an issue or pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request
