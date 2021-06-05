import {ApiService} from '../Api.Service';
import {PermissionsTemplateModel} from '../../models/PermissionsTemplateModel';
import {SendPermissionsTemplateModel} from '../../components/storage.settings/storage.sttings.component';

export class ApiStoragePermission{
  private static ServiceName = 'storage/permission';

  static delete(sId: string, pId: number): any{
    return this.http(`/${sId}/${pId}/delete`, 'DELETE');
  }

  static edit(sId: string, template: PermissionsTemplateModel): any{
    return this.http(`/edit?sID=${sId}&JsonModel=${JSON.stringify(new SendPermissionsTemplateModel(template))}`, 'POST');
  }

  static create(sId: string, template: PermissionsTemplateModel): any{
    return this.http(`/create?sID=${sId}&JsonModel=${JSON.stringify(new SendPermissionsTemplateModel(template))}`, 'POST');
  }

  static getList(id: string): any{
    return this.http(`/list?sID=${id}`, 'GET');
  }

  static http(URL: string, Type: string, Async?: boolean): any {
    const api = new ApiService(this.ServiceName);
    return api.http(URL, Type, Async);
  }
}
