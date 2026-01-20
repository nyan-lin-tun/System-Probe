# System-Probe

**ng-sys-telemetry**

A specialized web-based diagnostic dashboard built with **Angular**. The goal is to "crawl" and display hardware and network specifications of the host machine through the lens of the browser's sandboxed APIs.

## Features

- **Compute & OS:** CPU core count, OS platform/architecture, GPU Renderer.
- **Memory & Storage:** Browser memory usage, available disk quota.
- **Network Identity:** Public IPv4/IPv6 lookup, connection speed/type.

## Technical Stack

- **Framework:** Angular (v21+)
- **Platform:** GitHub Pages
- **Key APIs:** `Navigator`, `Performance`, `StorageManager`, `ipify`

## Architecture

The application follows a service-oriented architecture:
- **TelemetryService:** Handles data polling and async fetches.
- **DisplayComponent:** High-density grid UI (Terminal/Cyberpunk aesthetic).

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/System-Probe.git
    cd System-Probe
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    ng serve
    ```

4.  **Open the application:**
    Navigate to `http://localhost:4200/` in your browser. The app will automatically reload if you change any of the source files.

## Privacy & Security

**System-Probe** is designed with privacy in mind:
- **Local Execution:** All hardware and browser specification data (CPU, Memory, GPU) is queried locally via standard Web APIs (`Navigator`, `Performance`).
- **No Data Exfiltration:** This data is displayed *only* in your browser window and is not sent to any backend server.
- **IP Address:** The only external network request is to the `ipify` API to retrieve your public IP address for display purposes.

## Browser Support

This application relies on modern Web APIs. For the best experience, use the latest version of:
- Google Chrome / Chromium-based browsers (Edge, Brave)
- Mozilla Firefox
- Safari (Some hardware concurrency features may vary)

## License

This project is licensed under the [GPL-3.0 License](LICENSE).

## Contributors

- [Gemini](https://gemini.google.com/) - Main Contributor