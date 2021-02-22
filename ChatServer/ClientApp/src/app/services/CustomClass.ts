import {Location} from '@angular/common';
import {ChatHub} from './app.service.signalR';

export class UrlParameters{
  private static local: Location;
  static initialize(l: Location): void{
    this.local = l;
  }
  public static Get(url: string): any{
    const resultObj = {};
    const lastIndex = url.split('/')[url.split('/').length - 1];
    let parameters = '';
    for (let i = 1; i < lastIndex.split('?').length; i++){
      parameters += lastIndex.split('?')[i] + ((lastIndex.split('?').length - i - 1 <= 0) ? '' : '?');
    }
    const parametersArr = parameters.split('&');
    parametersArr.forEach(item => {
      const tmp = item.split('=');
      resultObj[tmp[0]] = tmp[1];
    });
    return (resultObj[0]) ? resultObj : {};
  }
  public static Set(Parameters: object, url: string): void{
    let newUrlParametersString = (Object.keys(Parameters).length > 0) ? '?' : '';
    // tslint:disable-next-line:forin
    for (const obj in Parameters){
      newUrlParametersString += `${obj}=${Parameters[obj]}&`;
    }
    newUrlParametersString = newUrlParametersString.slice(0, -1);
    const path = url.split('?')[0].replace(`${location.protocol}//${location.host}`, '');
    this.local.go(path, newUrlParametersString);
  }
  public static Add(Parameters: object, url: string): void{
    const oldUrlParameters = this.Get(url);
    const newUrlParameters = {};
    let resultString = '?';
    if (Object.keys(oldUrlParameters).length > 0) {
      for (const obj in oldUrlParameters){
      if (Parameters[obj]){
        newUrlParameters[obj] = Parameters[obj];
      }
      else {
        newUrlParameters[obj] = oldUrlParameters[obj];
      }
    }
    }
    for (const obj in Parameters){
      if (!newUrlParameters[obj]){
        newUrlParameters[obj] = Parameters[obj];
      }
    }
    // tslint:disable-next-line:forin
    for (const obj in newUrlParameters){
      resultString += `${obj}=${newUrlParameters[obj]}&`;
    }
    resultString = resultString.slice(0, -1);

    const path = url.split('?')[0].replace(`${location.protocol}//${location.host}`, '');
    this.local.go(path, resultString);
  }
}

export class DateAddon{
  static Format(obj: Date, template: string = 'YYYY.MM.DD hh:mm:ss'): string{
    const res = template.replace('YYYY', obj.getFullYear().toString())
    .replace('MM', this.addNull(obj.getMonth() + 1))
    .replace('DD', this.addNull(obj.getDate()))
    .replace('hh', this.addNull(obj.getHours()))
    .replace('mm', this.addNull(obj.getMinutes()))
    .replace('ss', this.addNull(obj.getSeconds()));
    return res;
  }
  private static addNull(num: number): string{
    return (num > 9) ? num.toString() : '0' + num;
  }
}

export class Convert{
  public static toDataURL(url, callback: (res: any) => void): void {
    const xhr = new XMLHttpRequest();
    xhr.onload = (): void => {
      const reader = new FileReader();
      reader.onloadend = (): void => {
        callback(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }
  public static FileToBase64(selectFile, callback: (res: any) => void): void{
    const reader = new FileReader();
    reader.readAsDataURL(selectFile);
    reader.onload = () => {
      callback(reader.result);
    };
    reader.onerror = (error) => {
      console.error('Error: ', error);
    };
  }
}

export class Network{
  public static UploadFile(URL, UploadObj, paramName: string = 'file'): void{
    const fd = new FormData();
    fd.append(paramName, UploadObj);
    $.ajax({
      url: URL,
      type: 'post',
      data: fd,
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + ChatHub.authorizationService.token
      },
      contentType: false,
      processData: false,
      success: (response) => {
        return;
        if (response !== 0){
          console.log('file uploaded');
        }
        else{
          console.log('file not uploaded');
        }
      },
    });
  }
}

export const copyToClipboard = (text: string) => {
  document.addEventListener('copy', (e: ClipboardEvent) => {
    e.clipboardData.setData('text/plain', text);
    e.preventDefault();
    // @ts-ignore
    document.removeEventListener('copy');
  });
  document.execCommand('copy');
};
