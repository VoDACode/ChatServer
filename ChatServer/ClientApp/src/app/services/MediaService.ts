import {ApiService} from './Api.Service';


export class MediaService {
  public static get host(): string{
    return 'https://media.chat.privatevoda.space';
  }

  public static DownloadFile(sID: string, mID: string, fullUrl: string, fileName: string): void{
    const api = new ApiService('');
    $.ajax({
      url: `${this.host}/files/${sID}/${mID}/${fullUrl}`,
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + api.token
      },
      xhrFields: {
        responseType: 'blob'
      },
      success: (data) => {
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(data);
        a.href = url;
        a.download = fileName;
        document.body.append(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  public static ConstructImageUrl(key: string): string{
    return `${this.host}/image?key=${key}`;
  }
}
