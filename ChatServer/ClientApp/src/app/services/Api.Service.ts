import {CookieService} from './CookieService';

export class ApiService{
  private ServiceName = '';

  constructor(ServiceName: string) {
    this.ServiceName = ServiceName;
  }

  public get tokenName(): string{
    return 'auth_token';
  }

  public get RootUrl(): string{
    return 'https://api.chat.privatevoda.space:5100';
  }
  public get token(): string{
    return localStorage.getItem(this.tokenName);
  }

  public http(URL: string, Type: string, Async: boolean = false, Auth: boolean = true): any{
    const options = {
      url: this.RootUrl + '/' + this.ServiceName + URL,
      type: Type,
      async: Async,
      headers: {
        Accept: 'application/json',
        Authorization: undefined
      },
      dataType: 'json'
    };
    if (Auth){
      options.headers.Authorization = 'Bearer ' + this.token;
    }
    return $.ajax(options).responseJSON;
  }
}
