import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'tmf-dashboard-sidebar',
  imports: [RouterLink, RouterLinkActive, MatIcon],
  templateUrl: './dashboard-sidebar.html',
  styles: `
    :host {
      display: block;
    }
  `
})
export class DashboardSidebar {

}
