import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiAuth} from '../../../services/Api/ApiAuth';

@Component({
  selector: 'app-set-forgot-password',
  templateUrl: 'set.forgot.password.component.html'
})
export class SetForgotPasswordComponent{
  errors: Array<string> = new Array<string>();
  Password: string;
  key: string;
  email: string;
  constructor(private routeAction: ActivatedRoute, private route: Router) {
    routeAction.params.subscribe(params => {
      this.key = params.key;
    });
    routeAction.queryParams.subscribe(query => {
      this.email = query.email;
    });
  }
  eventSetPassword(): void{
    const result = ApiAuth.setForgotPassword(this.key, this.Password, this.email);
    this.errors.length = 0;
    if (result.isErrror == true){
      this.errors.push(result.text);
      return;
    }
    this.route.navigate(['/login']);
  }
}
