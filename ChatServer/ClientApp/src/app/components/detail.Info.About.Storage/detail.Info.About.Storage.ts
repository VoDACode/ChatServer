import {Component} from '@angular/core';
import {ChatHub} from '../../services/app.service.signalR';
import {ChatModel} from '../../models/ChatModel';
import {ActivatedRoute} from '@angular/router';
import {StorageType} from '../../models/StorageModel';

@Component({
  selector: 'app-detail-info-storage',
  templateUrl: './detail.Info.About.Storage.html'
})

export class DetailInfoAboutStorageComponent{
  SelectChat: ChatModel = new ChatModel();
  constructor(private route: ActivatedRoute) {
    route.params.subscribe(params => {
      this.SelectChat.Storage = ChatHub.authorizationService.http(`api/storage/${params.id}`, 'POST');
      this.SelectChat.Storage.imgContent = this.SelectChat.Storage.imgContent == null ? '{{other}}' : `api/image?key=${this.SelectChat.Storage.imgContent}`;
      if (this.SelectChat.Storage.imgContent === '{{other}}'){
        if (this.SelectChat.Storage.type === StorageType.Private) {
          this.SelectChat.Storage.imgContent = 'assets/imgs/default-user-avatar-96.png';
        } else{
          this.SelectChat.Storage.imgContent = 'assets/imgs/default-storage-icon.png';
        }
      }
      const res = ChatHub.authorizationService.http(`api/storage/user/list?sId=${params.id}`, 'POST');
      this.SelectChat.UsersList = res;
    });
  }
}
