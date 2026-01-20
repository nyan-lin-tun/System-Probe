import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface ComputeSpecs {
  cores: number;
  platform: string;
  userAgent: string;
  gpuRenderer: string;
  screenResolution: string;
}

export interface MemorySpecs {
  deviceMemory: number | string; // GB (approx)
  jsHeapSizeLimit: string;
  totalJSHeapSize: string;
  usedJSHeapSize: string;
  storageQuota: string;
  storageUsage: string;
}

export interface NetworkSpecs {
  ip: string;
  isp: string;
  city: string;
  country: string;
  downlink: number | string;
  rtt: number | string;
  effectiveType: string;
  saveData: boolean;
}

export interface LocationSpecs {
  latitude: number | string;
  longitude: number | string;
  accuracy: number | string;
  status: 'Permission Denied' | 'Unavailable' | 'Locating...' | 'Granted' | 'Idle';
}

export interface BatterySpecs {
  level: string;
  charging: string;
  chargingTime: string;
  dischargingTime: string;
  supported: boolean;
}

export interface SystemSpecs {
  compute: ComputeSpecs;
  memory: MemorySpecs;
  network: NetworkSpecs;
  location: LocationSpecs;
  battery: BatterySpecs;
}

@Injectable({
  providedIn: 'root',
})
export class Telemetry {
  private http = inject(HttpClient);

  async getSystemSpecs(): Promise<SystemSpecs> {
    const [compute, memory, network, location, battery] = await Promise.all([
      this.getComputeSpecs(),
      this.getMemorySpecs(),
      this.getNetworkSpecs(),
      this.getGeolocation(),
      this.getBatterySpecs(),
    ]);

    return { compute, memory, network, location, battery };
  }

  private getComputeSpecs(): ComputeSpecs {
    const nav = navigator as any;
    const uaData = nav.userAgentData;
    
    let platform = nav.platform || 'Unknown';
    let arch = 'Unknown';

    if (uaData) {
      platform = uaData.platform;
      // Heuristic for architecture if not directly available
      if (uaData.brands?.some((b: any) => b.brand.includes('ARM'))) arch = 'ARM';
      else if (uaData.brands?.some((b: any) => b.brand.includes('Intel'))) arch = 'x86';
    }

    // Fallback parsing for common cases
    if (nav.userAgent.includes('Win64') || nav.userAgent.includes('x64')) arch = 'x64';
    if (nav.userAgent.includes('Macintosh') && nav.userAgent.includes('Intel')) arch = 'Intel'; 
    // Note: M1/M2 Macs often still report as Intel in userAgent for compat, 
    // but high hardwareConcurrency (e.g. > 8) is a hint.

    return {
      cores: nav.hardwareConcurrency || 'Unknown',
      platform: `${platform} ${arch !== 'Unknown' ? '(' + arch + ')' : ''}`,
      userAgent: nav.userAgent,
      gpuRenderer: this.getGpuRenderer(),
      screenResolution: `${window.screen.width}x${window.screen.height}`,
    };
  }

  private async getBatterySpecs(): Promise<BatterySpecs> {
    const nav = navigator as any;
    if (!nav.getBattery) {
      return {
        level: 'N/A',
        charging: 'N/A',
        chargingTime: 'N/A',
        dischargingTime: 'N/A',
        supported: false
      };
    }

    try {
      const battery = await nav.getBattery();
      return {
        level: `${Math.round(battery.level * 100)}%`,
        charging: battery.charging ? 'Yes' : 'No',
        chargingTime: battery.chargingTime === Infinity ? 'Unknown' : `${battery.chargingTime}s`,
        dischargingTime: battery.dischargingTime === Infinity ? 'Unknown' : `${battery.dischargingTime}s`,
        supported: true
      };
    } catch (e) {
      return {
        level: 'Error',
        charging: 'Error',
        chargingTime: 'Error',
        dischargingTime: 'Error',
        supported: false
      };
    }
  }

  private async getMemorySpecs(): Promise<MemorySpecs> {
    const nav = navigator as any;
    const memory = (performance as any).memory;

    let storageInfo = { quota: 'N/A', usage: 'N/A' };
    if (nav.storage && nav.storage.estimate) {
      try {
        const estimate = await nav.storage.estimate();
        storageInfo = {
          quota: this.formatBytes(estimate.quota),
          usage: this.formatBytes(estimate.usage),
        };
      } catch (e) {
        console.error('Storage estimate failed', e);
      }
    }

    return {
      deviceMemory: nav.deviceMemory ? `~${nav.deviceMemory} GB` : 'Unknown',
      jsHeapSizeLimit: memory ? this.formatBytes(memory.jsHeapSizeLimit) : 'N/A',
      totalJSHeapSize: memory ? this.formatBytes(memory.totalJSHeapSize) : 'N/A',
      usedJSHeapSize: memory ? this.formatBytes(memory.usedJSHeapSize) : 'N/A',
      storageQuota: storageInfo.quota,
      storageUsage: storageInfo.usage,
    };
  }

  private async getNetworkSpecs(): Promise<NetworkSpecs> {
    const nav = navigator as any;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection || {};

    let netData = { ip: 'Fetching...', isp: 'Unknown', city: 'Unknown', country: 'Unknown' };
    try {
      // Using ipapi.co for richer data (free tier, rate limited)
      const response: any = await firstValueFrom(this.http.get('https://ipapi.co/json/'));
      netData = {
        ip: response.ip,
        isp: response.org || response.asn,
        city: response.city,
        country: response.country_name,
      };
    } catch (e) {
      netData.ip = 'Error fetching IP';
    }

    return {
      ...netData,
      downlink: conn.downlink ? `${conn.downlink} Mbps` : 'Unknown',
      rtt: conn.rtt ? `${conn.rtt} ms` : 'Unknown',
      effectiveType: conn.effectiveType || 'Unknown',
      saveData: conn.saveData || false,
    };
  }

  async getGeolocation(): Promise<LocationSpecs> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({
          latitude: 'N/A',
          longitude: 'N/A',
          accuracy: 'N/A',
          status: 'Unavailable',
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude.toFixed(4),
            longitude: position.coords.longitude.toFixed(4),
            accuracy: `${Math.round(position.coords.accuracy)}m`,
            status: 'Granted',
          });
        },
        (error) => {
          let status: LocationSpecs['status'] = 'Unavailable';
          if (error.code === error.PERMISSION_DENIED) status = 'Permission Denied';
          resolve({
            latitude: 'N/A',
            longitude: 'N/A',
            accuracy: 'N/A',
            status,
          });
        },
        { timeout: 5000 }
      );
    });
  }

  private getGpuRenderer(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'WebGL Unsupported';
      
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return 'Unknown GPU';

      return (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    } catch (e) {
      return 'Error detecting GPU';
    }
  }

  private formatBytes(bytes: number, decimals = 2): string {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}