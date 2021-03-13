import {Component} from '@angular/core';
import {ChatHub} from '../../../services/app.service.signalR';
import {UserModel} from '../../../models/UserModel';
import {Router} from '@angular/router';

@Component({
  selector: 'app-log-in-component',
  templateUrl: 'log-in.component.html'
})
export class LogInComponent {
  User: UserModel = new UserModel();
  Password = '';
  IsValid = true;
  constructor(private router: Router) {
  }
  actionLogIn(): void{
    const expEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const expPassword = /[0-9a-z]+/i;
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
          this.router.navigate(['/chat']);
        }
      });
    }
    this.IsValid = true;
  }
  private PrintWarning(message): void{
    this.IsValid = false;
    const obj = document.createElement('span');
    obj.innerHTML = message;
    document.getElementById('WarningBox').appendChild(obj);
    document.getElementById('WarningBox').innerHTML += '</br>';
  }
}
