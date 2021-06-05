import {ApiService} from '../Api.Service';

export class ApiConfirm{
  private static ServiceName = 'confirm';

  static confirm(key: string, email: string): any{
    return this.http(`/event/${key}?email=${email}`, 'GET', false, false);
  }

  static http(URL: string, Type: string, Async: boolean = false, Auth: boolean = true): any {
    const api = new ApiService(this.ServiceName);
    return api.http(URL, Type, Async, Auth);
  }
}
