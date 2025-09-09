import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TmfIconEnum } from '@share/icon.enum';
import { Button } from "@components/button/button";
import { InputText } from "@components/form/input-text/input-text";
import { Layout1Wapper } from '@components/layout-1-wapper/layout-1-wapper';

@Component({
  selector: 'tmf-sign-up',
  imports: [MatIcon, Button, InputText, Layout1Wapper],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './sign-up.html',
  styles: ``
})
export default class SignUp {
  get TmfIcon() {
    return TmfIconEnum;
  }
}
