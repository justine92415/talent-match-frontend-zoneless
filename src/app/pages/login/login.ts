import { Component, inject } from '@angular/core';
import { InputText } from '@components/form/input-text/input-text';
import { Button } from '@components/button/button';
import { MatIcon } from '@angular/material/icon';
import { TmfIconEnum } from '@share/icon.enum';
import { Layout1Wapper } from '@components/layout-1-wapper/layout-1-wapper';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { emailValidator } from '@share/validator';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'tmf-login',
  imports: [MatIcon, InputText, Button, Layout1Wapper, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styles: ``,
})
export default class Login {
  fb = inject(FormBuilder);
  private location = inject(Location);

  get TmfIcon() {
    return TmfIconEnum;
  }

  goBack() {
    this.location.back();
  }

  form = this.fb.group({
    email: ['',emailValidator],
    password: [''],
  });
}
