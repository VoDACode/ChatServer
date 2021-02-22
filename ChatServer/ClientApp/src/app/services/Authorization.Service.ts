import { Injectable} from '@angular/core';
import { Router } from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import {ChatHub} from './app.service.signalR';
import {Convert} from './CustomClass';

@Injectable({
  providedIn: 'root'
})

export class AuthorizationService{
  uri = 'api';
  private router;
  private tokenName = 'auth_token';
  constructor(router: Router, private cookieService: CookieService) {
    this.router = router;
  }
  public get ConfirmEmailProcess(): boolean{
    return this.cookieService.check('confirm_key');
  }
  public get token(): string{
    return (this.logIn) ? this.cookieService.get(this.tokenName) : null;
  }
  public get logIn(): boolean {
    return this.cookieService.check(this.tokenName);
  }
  public get IsValidToken(): boolean{
    const res = this.http(`${this.uri}/account/isAuthorize`, 'get');
    return (!res) ? false : res.status;
  }

  public UpdateUserInfo(): void{
    const res = this.http(`${this.uri}/user/my`, 'get');
    ChatHub.User.id = res.id;
    ChatHub.User.nickname = res.nickname;
    ChatHub.User.userName = res.userName;
    ChatHub.User.email = res.email;
    ChatHub.User.deleteIfMissingFromMonths = res.deleteIfMissingFromMonths;
    if (res.imgContent !== null){
      ChatHub.User.imgContent = `api/image?key=${res.imgContent}`;
    }else {
      Convert.toDataURL('assets/imgs/default-user-avatar-96.png', (resCall) => {
        ChatHub.User.imgContent = resCall;
      });
    }
  }
  async login(email: string, password: string, callBack: (status: boolean) => void): Promise<void> {
    $.post(`${this.uri}/account/authenticate?email=${email}&password=${password}`, (resp) => {
      this.cookieService.set(this.tokenName, resp.token);
      callBack((resp.token !== null));
    });
  }
  public logOut(): void{
    this.http(`${this.uri}/account/logout`, 'DELETE');
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
