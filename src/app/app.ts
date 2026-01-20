import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Display } from './components/display/display';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Display],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  title = 'ng-sys-telemetry';
}