import {Component} from '@angular/core';
import {ChatHub} from '../../services/app.service.signalR';
import {Router} from '@angular/router';

@Component({
  selector: 'app-set-password',
  templateUrl: './set.password.page.html'
})

export class SetPasswordComponent{
  OldPassword: string;
  NewPassword: string;
  ConfirmNewPassword: string;
  IsValid = true;

  constructor(private router: Router) {
  }

  actionSetPassword(): void {
    const expPassword = /([0-9a-z]+){8,255}/i;
    this.IsValid = true;
    document.getElementById('WarningBox').innerHTML = '';
    if (this.NewPassword !== this.ConfirmNewPassword){
      this.PrintWarning('Passwords do not match!');
    }
    if (!expPassword.test(this.NewPassword) && this.NewPassword.length < 8){
      this.PrintWarning('Incorrectly filled "Password" field!');
    }
    if (this.IsValid){
      const res = ChatHub.authorizationService.http(`api/user/my/password/set?newP=${this.NewPassword}&oldP=${this.OldPassword}`, 'POST');
      console.log(res);
      if (!res.errorText){
        this.PrintWarning(res.errorText);
      }else {
        this.router.navigate(['/']);
      }
    }
  }
  private PrintWarning(message): void{
    this.IsValid = false;
    const obj = document.createElement('span');
    obj.innerHTML = message;
    document.getElementById('WarningBox').appendChild(obj);
    document.getElementById('WarningBox').innerHTML += '</br>';
  }
}
