import {ApiService} from '../Api.Service';

export class ApiStorageJoin{
  private static ServiceName = 'storage/join';

  static list(sId: string): any{
    return this.http(`/list?sId=${sId}`, 'GET');
  }

  static create(sId: string): any{
    return this.http(`/create?sId=${sId}`, 'POST');
  }

  static delete(sId: string, key: string): any{
    return this.http(`/delete?sId=${sId}&key=${key}`, 'DELETE');
  }

  static JoinToOnKey(key: string): any{
    return this.http(`/${key}`, 'GET');
  }

  static StorageInfo(key: string): any{
    return this.http(`/info/${key}`, 'GET');
  }

  static http(URL: string, Type: string, Async?: boolean): any {
    const api = new ApiService(this.ServiceName);
    return api.http(URL, Type, Async);
  }
}
