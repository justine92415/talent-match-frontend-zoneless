import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TmfIcon } from '@components/tmf-icon/tmf-icon';

@Component({
  selector: 'app-root',
  imports: [MatIconModule, TmfIcon],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('talent-match-frontend-zoneless');
}
