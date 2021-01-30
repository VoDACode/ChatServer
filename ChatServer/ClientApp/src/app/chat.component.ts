import {Component} from '@angular/core';
import {ChatHub} from './services/app.service.signalR';
import {ChatModel} from './models/ChatModel';
import * as $ from 'jquery';
import {Convert} from './CustomClass';

@Component({
  templateUrl: 'source/html/chat.component.html',
  selector: 'app-chat'
})
export class ChatComponent{
  SearchQuery: string;
  ViewContactItem = this.getChatList();

  getSelectChat(): ChatModel{
    return ChatHub.selectChat;
  }
  getChatList(): Array<ChatModel>{
    return ChatHub.chatList;
  }
  openLeftTabMenu(): void{
    document.getElementById('LeftTabMenu').style.display = 'block';
    $('#LeftTabMenu').animate({
      left: '0'
    }, 500);
    $('app-message-region').bind( 'click', () => {
      $('#LeftTabMenu').animate({
        left: '-25%'
      }, 500);
    });
  }
  onChangeSearch(): void{
    if (this.SearchQuery.length !== 0) {
      const res = ChatHub.authorizationService.http(`/api/search?q=${this.SearchQuery}`, 'GET');
      this.ViewContactItem = new Array<ChatModel>();
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < res.length; i++) {
        const tmp = new ChatModel();
        tmp.Storage.id = res[i].id;
        tmp.Storage.name = res[i].name;
        tmp.Storage.uniqueName = res[i].uniqueName;
        tmp.Storage.imgContent = res[i].imgContent;
        if (tmp.Storage.imgContent === null) {
          if (tmp.Storage.type === 2) {
            Convert.toDataURL('assets/imgs/default-user-avatar-96.png', (img) => {
              tmp.Storage.imgContent = img;
            });
          } else if (tmp.Storage.type !== 2) {
            Convert.toDataURL('assets/imgs/default-storage-icon.png', (img) => {
              tmp.Storage.imgContent = img;
            });
          }
        }
        tmp.Storage.status = res[i].status;
        tmp.Storage.isPrivate = res[i].viewType;
        this.ViewContactItem.push(tmp);
      }
    }else {
      this.ViewContactItem = this.getChatList();
    }
  }
  onOpenCreateMenu(): void{
    $('#createStorageMenu').show();
  }

  onSelectContact(sId): void{
    ChatHub.selectChat = ChatHub.chatList.find(o => o.Storage.id === sId);
  }
}
