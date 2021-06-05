import {Component} from '@angular/core';
import {ChatHub} from '../../services/app.service.signalR';
import {ChatModel} from '../../models/ChatModel';
import {ActivatedRoute} from '@angular/router';
import {StorageType} from '../../models/StorageModel';
import {MediaService} from '../../services/MediaService';
import {ApiStorage} from '../../services/Api/ApiStorage';

@Component({
  selector: 'app-detail-info-storage',
  templateUrl: './detail.Info.About.Storage.html'
})

export class DetailInfoAboutStorageComponent{
  SelectChat: ChatModel = new ChatModel();
  constructor(private route: ActivatedRoute) {
    route.params.subscribe(params => {
      this.SelectChat.Storage = ApiStorage.getStorageInfo(params.id);
      this.SelectChat.Storage.imgContent = this.SelectChat.Storage.imgContent == null ? '{{other}}' : MediaService.ConstructImageUrl(this.SelectChat.Storage.imgContent);
      if (this.SelectChat.Storage.imgContent === '{{other}}'){
        if (this.SelectChat.Storage.type === StorageType.Private) {
          this.SelectChat.Storage.imgContent = 'assets/imgs/default-user-avatar-96.png';
        } else{
          this.SelectChat.Storage.imgContent = 'assets/imgs/default-storage-icon.png';
        }
      }
      this.SelectChat.UsersList = ApiStorage.usersList(params.id);
    });
  }
}
