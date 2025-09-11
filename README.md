# AMARG Downloader

<div align="center">
  <img src="src/assets/A letter Logo.png" alt="AMARG Logo" width="200"/>
</div>

An advanced media downloader built with Tauri, Rust, and TypeScript.

## 🚀 Features

- 📥 Download videos from various platforms
- 🎵 Audio/video format selection
- 📊 Download progress tracking
- 🌙 Light/Dark theme support
- 🔄 Concurrent downloads
- 💾 Download history management
- 🖥️ System tray integration
- 🚀 Fast and efficient downloads using yt-dlp
- 🎬 FFmpeg integration for media processing

## 🛠️ Tech Stack

- **Frontend**: TypeScript, HTML, CSS
- **Backend**: Rust with Tauri
- **Dependencies**: 
  - yt-dlp
  - FFmpeg
  - Tokio (Rust async runtime)

## 📁 Project Structure

```
project/
├── src/                      # Frontend source code
│   ├── assets/              # Images and static resources
│   ├── components/          # UI components
│   ├── utils/              # Utility functions
│   ├── main.ts             # Main entry point
│   └── styles.css          # Global styles
├── src-tauri/              # Rust backend code
│   ├── src/
│   │   ├── downloads.rs    # Download management
│   │   ├── info_urls.rs    # URL processing
│   │   ├── lib.rs         # Core library
│   │   └── main.rs        # Backend entry point
│   ├── resources/         # External binaries (ffmpeg, yt-dlp)
│   └── Cargo.toml        # Rust dependencies
└── public/               # Public assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Rust (latest stable)
- FFmpeg
- yt-dlp

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd amarg-downloader
```

2. Install dependencies:
```bash
npm install
```

3. Build the application:
```bash
npm run tauri build
```

## 🔧 Development

- Run in development mode:
```bash
npm run tauri dev
```

## 📸 Screenshots

<div align="center">
  <img src="src/assets/Amarg Downloader.png" alt="Main Interface" width="600"/>
</div>

## 🌟 Features in Detail

1. **Video Downloads**
   - Multi-format support
   - Quality selection
   - Progress tracking

2. **Queue Management**
   - Concurrent downloads
   - Priority queue
   - Download history

3. **User Interface**
   - Clean and modern design
   - Responsive layout
   - Theme switching

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.