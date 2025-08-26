import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Header } from "@components/header/header";

@Component({
  selector: 'app-root',
  imports: [MatIconModule, Header],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('talent-match-frontend-zoneless');
}
