import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {ChatHub} from '../../services/app.service.signalR';
import {ApiAuth} from '../../services/Api/ApiAuth';

@Component({
  templateUrl: './log.reg.in.component.html',
  selector: 'app-reg-log'
})

export class LogRegInComponent{
  constructor(private router: Router) {
    if (ApiAuth.isAuth){
      this.router.navigate(['/chat']);
    }
  }
}
