import { Component, inject } from '@angular/core';
import { InputText } from '@components/form/input-text/input-text';
import { Button } from '@components/button/button';
import { MatIcon } from '@angular/material/icon';
import { TmfIconEnum } from '@share/icon.enum';
import { Layout1Wapper } from '@components/layout-1-wapper/layout-1-wapper';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { emailValidator } from '@share/validator';

@Component({
  selector: 'tmf-login',
  imports: [MatIcon, InputText, Button, Layout1Wapper, ReactiveFormsModule, JsonPipe],
  templateUrl: './login.html',
  styles: ``,
})
export default class Login {
  fb = inject(FormBuilder);

  get TmfIcon() {
    return TmfIconEnum;
  }

  form = this.fb.group({
    email: ['',emailValidator],
    password: [''],
  });
}
