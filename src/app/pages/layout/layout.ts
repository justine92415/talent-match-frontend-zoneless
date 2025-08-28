import { Component } from '@angular/core';
import { Header } from "@components/header/header";
import { Footer } from "@components/footer/footer";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'tmf-layout',
  imports: [Header, Footer, RouterOutlet],
  templateUrl: './layout.html',
  styles: ``
})
export default class Layout {

}
