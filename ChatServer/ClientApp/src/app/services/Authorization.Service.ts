import { Injectable} from '@angular/core';
import { Router } from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import {ChatHub} from './app.service.signalR';
import {Convert} from './CustomClass';
import {UserModel} from '../models/UserModel';
import {ApiAuth} from './Api/ApiAuth';

@Injectable({
  providedIn: 'root'
})

export class AuthorizationService{
  uri = 'https://api.chat.privatevoda.space:5100/auth';
  private router;
  public get tokenName(): string{
    return 'auth_token';
  }
  constructor(router: Router, private cookieService: CookieService) {
    this.router = router;
  }
  public get ConfirmEmailProcess(): boolean{
    return this.cookieService.check('confirm_key');
  }
  public get token(): string{
    return (ApiAuth.isAuth) ? this.cookieService.get(this.tokenName) : null;
  }

  public http(URL: string, Type: string, Async: boolean = false): any{
    const response = $.ajax({
      url: URL,
      type: Type,
      async: Async,
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + this.token
      },
      dataType: 'json'
    });
    return response.responseJSON;
  }
}
