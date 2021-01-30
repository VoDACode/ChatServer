import { ChatHub } from './services/app.service.signalR';
export class UrlParameters {
    static initialize(l) {
        this.local = l;
    }
    static Get(url) {
        const resultObj = {};
        const lastIndex = url.split('/')[url.split('/').length - 1];
        let parameters = '';
        for (let i = 1; i < lastIndex.split('?').length; i++) {
            parameters += lastIndex.split('?')[i] + ((lastIndex.split('?').length - i - 1 <= 0) ? '' : '?');
        }
        const parametersArr = parameters.split('&');
        parametersArr.forEach(item => {
            const tmp = item.split('=');
            resultObj[tmp[0]] = tmp[1];
        });
        return (resultObj[0]) ? resultObj : {};
    }
    static Set(Parameters, url) {
        let newUrlParametersString = (Object.keys(Parameters).length > 0) ? '?' : '';
        // tslint:disable-next-line:forin
        for (const obj in Parameters) {
            newUrlParametersString += `${obj}=${Parameters[obj]}&`;
        }
        newUrlParametersString = newUrlParametersString.slice(0, -1);
        const path = url.split('?')[0].replace(`${location.protocol}//${location.host}`, '');
        this.local.go(path, newUrlParametersString);
    }
    static Add(Parameters, url) {
        const oldUrlParameters = this.Get(url);
        const newUrlParameters = {};
        let resultString = '?';
        if (Object.keys(oldUrlParameters).length > 0) {
            for (const obj in oldUrlParameters) {
                if (Parameters[obj]) {
                    newUrlParameters[obj] = Parameters[obj];
                }
                else {
                    newUrlParameters[obj] = oldUrlParameters[obj];
                }
            }
        }
        for (const obj in Parameters) {
            if (!newUrlParameters[obj]) {
                newUrlParameters[obj] = Parameters[obj];
            }
        }
        // tslint:disable-next-line:forin
        for (const obj in newUrlParameters) {
            resultString += `${obj}=${newUrlParameters[obj]}&`;
        }
        resultString = resultString.slice(0, -1);
        const path = url.split('?')[0].replace(`${location.protocol}//${location.host}`, '');
        this.local.go(path, resultString);
    }
}
export class DateAddon {
    static Format(obj, template = 'YYYY.MM.DD hh:mm:ss') {
        const res = template.replace('YYYY', obj.getFullYear().toString())
            .replace('MM', this.addNull(obj.getMonth() + 1))
            .replace('DD', this.addNull(obj.getDate()))
            .replace('hh', this.addNull(obj.getHours()))
            .replace('mm', this.addNull(obj.getMinutes()))
            .replace('ss', this.addNull(obj.getSeconds()));
        return res;
    }
    static addNull(num) {
        return (num > 9) ? num.toString() : '0' + num;
    }
}
export class Convert {
    static toDataURL(url, callback) {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
            const reader = new FileReader();
            reader.onloadend = () => {
                callback(reader.result);
            };
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }
    static FileToBase64(selectFile, callback) {
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
export class Network {
    static UploadFile(URL, UploadObj, paramName = 'file') {
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
                if (response !== 0) {
                    console.log('file uploaded');
                }
                else {
                    console.log('file not uploaded');
                }
            },
        });
    }
}
export const copyToClipboard = (url) => {
    document.addEventListener('copy', (e) => {
        e.clipboardData.setData('text/plain', url);
        e.preventDefault();
        // @ts-ignore
        document.removeEventListener('copy');
    });
    document.execCommand('copy');
};
//# sourceMappingURL=CustomClass.js.map