import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Header } from "@components/header/header";
import { Footer } from "@components/footer/footer";

@Component({
  selector: 'app-root',
  imports: [MatIconModule, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('talent-match-frontend-zoneless');
}
