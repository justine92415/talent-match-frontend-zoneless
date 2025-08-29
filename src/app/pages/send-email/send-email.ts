import { Component } from '@angular/core';
import { InputText } from "@components/input-text/input-text";
import { Button } from "@components/button/button";
import { Layout1Wapper } from "@components/layout-1-wapper/layout-1-wapper";

@Component({
  selector: 'tmf-send-email',
  imports: [InputText, Button, Layout1Wapper],
  templateUrl: './send-email.html',
  styles: ``
})
export default class SendEmail {

}
