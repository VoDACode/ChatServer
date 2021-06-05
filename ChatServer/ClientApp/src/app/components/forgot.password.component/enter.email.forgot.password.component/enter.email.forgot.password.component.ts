import {Component} from '@angular/core';
import {ApiAuth} from '../../../services/Api/ApiAuth';

@Component({
  templateUrl: 'enter.email.forgot.password.component.html',
  selector: 'app-enter-email-forgot-password'
})
export class EnterEmailForgotPasswordComponent{
  selectEmail: string;
  errors: Array<string> = new Array<string>();
  eventSendConfirmEmail(): void{
    this.errors.length = 0;
    const expEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!expEmail.test(this.selectEmail)){
      this.errors.push('This is not email address!');
      return;
    }
    const res = ApiAuth.recoveryPassword(this.selectEmail);
    if (res.isError === true){
      this.errors.push(res.text);
    }
    console.log(res);
  }
}
