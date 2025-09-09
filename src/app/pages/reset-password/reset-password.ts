import { Component } from '@angular/core';
import { Button } from "@components/button/button";
import { InputText } from "@components/form/input-text/input-text";
import { Layout1Wapper } from "@components/layout-1-wapper/layout-1-wapper";

@Component({
  selector: 'tmf-reset-password',
  imports: [Button, InputText, Layout1Wapper],
  templateUrl: './reset-password.html',
  styles: ``
})
export default class ResetPassword {

}
