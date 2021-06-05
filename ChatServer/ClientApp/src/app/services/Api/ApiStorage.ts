import {ApiService} from '../Api.Service';
import {ContactModel} from '../../models/ContactModel';

export class ApiStorage{
  private static ServiceName = 'storage';

  static search(query: string): any{
    return this.http(`/search?q=${query}`, 'GET', false);
  }

  static getType(id: string): any{
    return this.http(`/type/${id}`, 'GET', false);
  }

  static edit(storage: ContactModel): any{
    return this.http(`/edit?sID=${storage.id}&name=${storage.name}&UName=${storage.uniqueName}&IsPrivate=${storage.isPrivate}`, 'POST');
  }

  static create(storage: ContactModel): any{
    const query = `/create?name=${storage.name}&UName=${storage.uniqueName}&IsPrivate=${storage.isPrivate}&type=${storage.type}`;
    return this.http(query, 'POST');
  }

  static delete(sID: string): any{
    return this.http(`/delete?sId=${sID}`, 'DELETE', true);
  }

  static JoinTo(id: string, objType: string): any{
    return this.http(`/join?sId=${id}&objectType=${objType}`, 'POST');
  }

  static usersList(sID: string): any{
    return this.http(`/user/list?sId=${sID}`, 'GET');
  }

  static getStorageInfo(sID: string): any{
    return this.http(`/${sID}`, 'GET');
  }

  static leave(sID: string): any{
    return this.http(`/leave?sId=${sID}`, 'POST');
  }

  static http(URL: string, Type: string, Async?: boolean): any {
    const api = new ApiService(this.ServiceName);
    return api.http(URL, Type, Async);
  }

}
