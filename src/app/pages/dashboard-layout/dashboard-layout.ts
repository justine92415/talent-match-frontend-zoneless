import { Component } from '@angular/core';
import { Header } from "@components/header/header";
import { Footer } from "@components/footer/footer";
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'tmf-dashboard-layout',
  imports: [Header, RouterOutlet, Footer, MatIcon, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.html',
  styles: ``
})
export default class DashboardLayout {

}
