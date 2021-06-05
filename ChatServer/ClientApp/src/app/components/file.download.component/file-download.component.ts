import {Component, Input} from '@angular/core';
import {StorageModel} from '../../models/StorageModel';
import {MessageModel} from '../../models/MessageModel';
import {MediaService} from '../../services/MediaService';

@Component({
  selector: 'app-file',
  templateUrl: 'file-download.component.html',
})

export class FileDownloadComponent {
  @Input() storage: StorageModel;
  @Input() message: MessageModel;

  eventDownloadFile(): void{
    MediaService.DownloadFile(this.storage.id, this.message.id, this.message.fileUrl, this.message.fileName);
  }
}
