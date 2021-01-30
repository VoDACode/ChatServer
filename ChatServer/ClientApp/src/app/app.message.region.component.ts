import {Component} from '@angular/core';
import {MessageCreateViewModel, MessageModel, MessageType} from './models/MessageModel';
import {Location} from '@angular/common';
import {ChatHub} from './services/app.service.signalR';
import {ChatModel} from './models/ChatModel';
import * as $ from 'jquery';

@Component({
  selector: `app-message-region`,
  templateUrl: './source/html/message.region.component.html'
})

export class AppMessageRegionComponent {
  IsVisible = true;
  TextContent = '';
  SelectFile: any;
  private location: Location;
  constructor(local: Location) {
    this.location = local;
  }
  sendMessage(): void{
    if (this.TextContent === '' && this.SelectFile === null) {
      return;
    }
    // @ts-ignore
    ChatHub.sendMessage(this.TextContent, document.querySelector('#input-SelectFiles').files[0]);
    this.TextContent = '';
    this.SelectFile = null;
  }
  getHubSelectChat(): ChatModel{
    return ChatHub.selectChat;
  }

  getHtmlContent(message: MessageModel): string{
    return MessageCreateViewModel.getHtmlContent(message);
  }

  selectFile(): void{
    $('#input-SelectFiles').click();
  }
  onOpenDetailInfo(): void{
    $('#detailedInfoAboutStorage').show();
    const res = ChatHub.authorizationService.http(`api/storage/user/list?sId=${ChatHub.selectChat.Storage.id}`, 'GET');
    ChatHub.selectChat.UsersList = res;
  }

  openMessageContextMenu(): boolean{
    return false;
  }
}
