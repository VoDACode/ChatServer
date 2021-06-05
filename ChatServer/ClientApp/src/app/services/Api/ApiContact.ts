import {ApiService} from '../Api.Service';

export class ApiContact{
  private static ServiceName = 'contact';

  static http(URL: string, Type: string, Async?: boolean): any {
    const api = new ApiService(this.ServiceName);
    return api.http(URL, Type, Async);
  }
}
