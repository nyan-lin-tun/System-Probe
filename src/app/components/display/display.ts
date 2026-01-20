import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Telemetry, SystemSpecs } from '../../services/telemetry';

@Component({
  selector: 'app-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './display.html',
  styleUrl: './display.scss'
})
export class Display implements OnInit {
  private telemetry = inject(Telemetry);
  
  specs = signal<SystemSpecs | null>(null);
  loading = signal<boolean>(true);

  async ngOnInit() {
    await this.refreshData();
  }

  async refreshData() {
    this.loading.set(true);
    try {
      const data = await this.telemetry.getSystemSpecs();
      this.specs.set(data);
    } catch (err) {
      console.error('Failed to load telemetry', err);
    } finally {
      this.loading.set(false);
    }
  }
}