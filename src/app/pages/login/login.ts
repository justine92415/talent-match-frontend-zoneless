import { Component } from '@angular/core';
import { InputText } from '@components/input-text/input-text';
import { Button } from '@components/button/button';
import { MatIcon } from '@angular/material/icon';
import { TmfIconEnum } from '@share/icon.enum';
import { Layout1Wapper } from "@components/layout-1-wapper/layout-1-wapper";

@Component({
  selector: 'tmf-login',
  imports: [MatIcon, InputText, Button, Layout1Wapper],
  templateUrl: './login.html',
  styles: ``,
})
export default class Login {
  get TmfIcon() {
    return TmfIconEnum;
  }
}
