import {ApiService} from '../Api.Service';
import {UserModel} from '../../models/UserModel';

export class ApiAuth{
  private static ServiceName = 'auth';

  static login(email: string, password: string): any{
    const res = this.http(`/auth?email=${email}&password=${password}`, 'POST');
    const api = new ApiService('');
    localStorage.setItem(api.tokenName, res.token);
    return res;
  }

  static registration(user: UserModel, password: string): any{
    return this.http(`/registration?email=${user.email}&password=${password}&userName=${user.userName}&nickName=${user.nickname}`, 'POST');
  }

  static get isAuth(): boolean{
    return this.http('/isValid', 'GET');
  }

  static recoveryPassword(email: string): any{
    return this.http(`/forgot?email=${email}`, 'POST', false, false);
  }

  static setForgotPassword(key: string, password: string, email: string): any{
    return this.http(`/forgot/${key}/set?password=${password}&email=${email}`, 'POST', false, false);
  }

  static http(URL: string, Type: string, Async: boolean = false, Auth: boolean = true): any {
    const api = new ApiService(this.ServiceName);
    return api.http(URL, Type, Async, Auth);
  }
}
