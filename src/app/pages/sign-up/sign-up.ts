import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TmfIconEnum } from '@share/icon.enum';
import { Button } from "@components/button/button";
import { InputText } from "@components/input-text/input-text";

@Component({
  selector: 'tmf-sign-up',
  imports: [MatIcon, Button, InputText],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './sign-up.html',
  styles: ``
})
export default class SignUp {
  get TmfIcon() {
    return TmfIconEnum;
  }
}
