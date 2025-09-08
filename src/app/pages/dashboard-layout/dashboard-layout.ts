import { Component } from '@angular/core';
import { Header } from "@components/header/header";
import { Footer } from "@components/footer/footer";
import { DashboardSidebar } from "@components/dashboard-sidebar/dashboard-sidebar";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'tmf-dashboard-layout',
  imports: [Header, RouterOutlet, Footer, DashboardSidebar],
  templateUrl: './dashboard-layout.html',
  styles: ``
})
export default class DashboardLayout {

}
