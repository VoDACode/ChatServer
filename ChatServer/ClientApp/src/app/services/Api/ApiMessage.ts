import {ApiService} from '../Api.Service';
import {Network} from '../CustomClass';

export class ApiMessage{
  private static ServiceName = 'message';

  static send(id: string, text: string, isPrivate: boolean, file: any = null): void{
    const api = new ApiService(this.ServiceName);
    const url = '/post' + (isPrivate ? '/private?uID' : '?sID') + `=${id}&textContent=${text}`;
    if (file === null) {
      this.http(url, 'POST');
    }else {
      Network.UploadFile(`${api.RootUrl}/${this.ServiceName}/${url}`, file, 'file');
    }
  }

  static edit(sID: string, mID: string, newText: string): any{
    return this.http(`/edit?sID=${sID}&mID=${mID}&newText=${newText}`, 'POST');
  }

  static delete(sID: string, mID: string): any{
    return this.http(`/delete?sID=${sID}&mID=${mID}`, 'DELETE');
  }

  static list(sID: string, limit = 100): any{
    return this.http(`/list?sID=${sID}&limit=${limit}`, 'GET');
  }

  static http(URL: string, Type: string, Async?: boolean): any {
    const api = new ApiService(this.ServiceName);
    return api.http(URL, Type, Async);
  }
}
