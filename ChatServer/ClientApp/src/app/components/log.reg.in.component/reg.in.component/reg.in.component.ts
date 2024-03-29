import {Component} from '@angular/core';
import {ChatHub} from '../../../services/app.service.signalR';
import {UserModel} from '../../../models/UserModel';
import {CookieService} from 'ngx-cookie-service';
import {Router} from '@angular/router';
import {ApiAuth} from '../../../services/Api/ApiAuth';
import {ApiUser} from '../../../services/Api/ApiUser';

@Component({
  selector: 'app-reg-in-component',
  templateUrl: 'reg.in.component.html'
})
export class RegInComponent{
  User: UserModel = new UserModel();
  Password = '';
  ConfirmPassword = '';
  IsValid = true;

  constructor(private cookie: CookieService, private router: Router) {}

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
    const result = ApiAuth.registration(this.User, this.Password);
    if (result.userKey != null){
      this.cookie.set('confirm_key', result.userKey);
      ChatHub.User = ApiUser.getMyInfo();
      ChatHub.initializeHub();
      this.router.navigate(['/confirmEmail']);
    }
  }
}
