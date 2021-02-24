import {Component, Input} from '@angular/core';
import {ChatHub} from '../../services/app.service.signalR';
import {StorageModel} from '../../models/StorageModel';
import {MessageModel} from '../../models/MessageModel';

@Component({
  selector: 'app-file',
  templateUrl: 'file-download.component.html',
})

export class FileDownloadComponent {
  @Input() storage: StorageModel;
  @Input() message: MessageModel;

  eventDownloadFile(): void{
    $.ajax({
      url: `api/media/${this.storage.id}/${this.message.id}/${this.message.fileUrl}`,
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + ChatHub.authorizationService.token
      },
      xhrFields: {
        responseType: 'blob'
      },
      success: (data) => {
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(data);
        a.href = url;
        a.download = this.message.fileName;
        document.body.append(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    });
  }
}
