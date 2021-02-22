import {Component} from '@angular/core';
import {UserModel} from '../../models/UserModel';
import {ChatHub} from '../../services/app.service.signalR';
import {CookieService} from 'ngx-cookie-service';

@Component({
  templateUrl: './log.reg.in.component.html',
  selector: 'app-reg-log'
})

export class LogRegInComponent{
  User: UserModel = new UserModel();
  Password = '';
  ConfirmPassword = '';
  IsVisibleRegIn = true;
  IsValid = true;
  constructor(private cookie: CookieService) {}
  ViewRegIn(val: boolean): void{
    this.IsVisibleRegIn = val;
  }
  actionLogIn(): void{
    const expEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const expPassword = /[0-9a-z]+/i;

    console.log('TP - ' + expPassword.test(this.Password));
    console.log('TE - ' + expEmail.test(String(this.User.email).toLowerCase()));
    if (!expPassword.test(this.Password) ||
      !expEmail.test(String(this.User.email).toLowerCase())) {
        this.PrintWarning('T - Wrong login or password!');
    }
    if (this.IsValid){
      ChatHub.authorizationService.login(this.User.email, this.Password, (status: boolean) => {
        if (!status) {
          this.PrintWarning('C - Wrong login or password!');
        }else{
          ChatHub.authorizationService.UpdateUserInfo();
          ChatHub.initializeHub();
        }
      });
    }
    this.IsValid = true;
  }
  actionRegIn(): void{
    document.getElementById('WarningBox').innerHTML = '';
    const expNickname = /[a-z]{4,255}/i;
    const expEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const expPassword = /([0-9a-z]+){8,255}/i;
    if (!expNickname.test(this.User.nickname)) {
      this.PrintWarning('Incorrectly filled "Nickname" field!');
    }
    if (!expNickname.test(this.User.userName)) {
      this.PrintWarning('Incorrectly filled "User name" field!');
    }
    if (!expEmail.test(String(this.User.email).toLowerCase())) {
      this.PrintWarning('Incorrectly filled "email" field!');
    }
    if (!expPassword.test(this.Password) || this.Password.length < 8) {
      this.PrintWarning('Incorrectly filled "Password" field!');
    }
    if (this.Password !== this.ConfirmPassword) {
      this.PrintWarning('Passwords do not match!');
    }
    if (this.IsValid){
      this.RegIn();
    }
  }
  private PrintWarning(message): void{
    this.IsValid = false;
    const obj = document.createElement('span');
    obj.innerHTML = message;
    document.getElementById('WarningBox').appendChild(obj);
    document.getElementById('WarningBox').innerHTML += '</br>';
  }
  private RegIn(): void{
    $.post(`api/account/registration?email=${this.User.email}&password=${this.Password}&userName=${this.User.userName}&nickName=${this.User.nickname}`, (data) => {
      this.cookie.set('confirm_key', data.userKey);
      ChatHub.authorizationService.UpdateUserInfo();
      ChatHub.initializeHub();
    });
  }
}
