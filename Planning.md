# PLANNING.md: ng-sys-telemetry

## 1. Project Vision
A specialized web-based diagnostic dashboard built with **Angular**. The goal is to "crawl" and display hardware and network specifications of the host machine through the lens of the browser's sandboxed APIs.

---

## 2. Technical Stack
* **Framework:** Angular (v21+)
* **Platform:** GitHub Pages
* **Architecture:** Service-Oriented (Decoupled Logic)
* **Key APIs:** * `Navigator` (Hardware/OS info)
    * `Performance` (Memory/Timing)
    * `StorageManager` (Disk quota)
    * `ipify` (Public IP discovery)

---

## 3. Data Collection Roadmap (The "Crawl")

### Phase A: Compute & OS
* **CPU:** Logical core count (`hardwareConcurrency`).
* **Architecture:** OS platform and bit-depth (via User Agent Data).
* **Graphics:** GPU Renderer identification via WebGL context.

### Phase B: Memory & Storage
* **Browser Memory:** Heap size limits and usage.
* **Web Storage:** Available disk quota for the current origin.

### Phase C: Network Identity
* **IPv4/IPv6:** External lookup via HTTPS API.
* **Connection:** Downlink speed and effective connection type (4G/WiFi).

---

## 4. System Architecture



1.  **TelemetryService:** The engine. Responsible for polling browser APIs and handling async IP fetches.
2.  **DisplayComponent:** The UI. A high-density grid layout (Terminal/Cyberpunk aesthetic) to show data points.
3.  **Deployment Script:** Automated build-and-push to the `gh-pages` branch.

---

## 5. Engineering Constraints
* **Privacy Buffering:** Acknowledge that browsers "fuzz" certain data (like RAM) to prevent fingerprinting.
* **Permissions:** Requesting storage persistence if necessary.

---

## 6. Execution Steps
1.  `ng new ng-sys-telemetry`
2.  Generate `TelemetryService`.
3.  Implement hardware detection logic.
4.  Install `angular-cli-ghpages`.
5.  Deploy to GitHub Pages.