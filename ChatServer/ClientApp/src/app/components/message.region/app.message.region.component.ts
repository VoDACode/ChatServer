import {Component} from '@angular/core';
import {MessageModel} from '../../models/MessageModel';
import {ChatHub} from '../../services/app.service.signalR';
import {ChatModel} from '../../models/ChatModel';
import * as $ from 'jquery';
import {StorageType} from '../../models/StorageModel';
import {copyToClipboard} from '../../services/CustomClass';
import {Router} from '@angular/router';
import {ApiMessage} from '../../services/Api/ApiMessage';
import {ApiStorage} from '../../services/Api/ApiStorage';

@Component({
  selector: `app-message-region`,
  templateUrl: './message.region.component.html'
})

export class AppMessageRegionComponent {
  get IsVisible(): boolean{
    return ChatHub.selectChat.Storage.id != null;
  }
  routingUrl = '';
  TextContent = '';
  SelectFile: any;
  IsDeleteMessage = true;
  IsEditMessage = true;
  IsEditMode = false;

  get IsSendMessage(): boolean{
    return ChatHub.selectChat.youPermissionsTemplateList.find(p => p.isSendMessage) != null ||
      ChatHub.selectChat.Storage.type === StorageType.Private;
  }
  get IsSendFile(): boolean{
    return ChatHub.selectChat.youPermissionsTemplateList.find(p => p.isSendFiles) != null ||
      ChatHub.selectChat.Storage.type === StorageType.Private;
  }

  get IsChannel(): boolean{
    return this.getHubSelectChat().Storage.type === StorageType.Channel;
  }
  get TargetMessage(): string{
    return $('#MessageMenu').attr('target-message');
  }
  constructor(private router: Router) {
  }
  sendMessage(): void{
    if (this.TextContent === '' && this.SelectFile === null) {
      return;
    }
    if (!this.IsEditMode) {
      let file = document.querySelector('#input-SelectFiles');
      if (file !== null) {
        // @ts-ignore
        file = file.files[0];
      }
      ChatHub.sendMessage(this.TextContent, file);
      this.TextContent = '';
      this.SelectFile = null;
    }else {
      this.eventSaveEditMessage();
    }
  }
  getHubSelectChat(): ChatModel{
    return ChatHub.selectChat;
  }

  selectFile(): void{
    $('#input-SelectFiles').click();
  }

  openMessageContextMenu(e, message: MessageModel): boolean{
    this.IsDeleteMessage = (
      this.getHubSelectChat().youPermissionsTemplateList.find(p => p.isDeleteMessages) != null ||
      // tslint:disable-next-line:triple-equals
        message.sender.id == ChatHub.User.id
    );
    this.IsEditMessage = (message.sender.id === ChatHub.User.id);
    $('#MessageMenu').attr('target-message', message.id);
    $('#MessageMenu').css({top: e.pageY, left: e.pageX, position: 'absolute'});
    $('#MessageMenu').show();
    return false;
  }

  eventEditMessage(): void{
    // tslint:disable-next-line:triple-equals
    const message = this.getHubSelectChat().MessageList.find(p => p.id == this.TargetMessage);
    this.IsEditMode = true;
    this.TextContent = message.textContent;
  }
  eventCancelEditMessage(): void{
    this.TextContent = '';
    this.IsEditMode = false;
  }
  eventSaveEditMessage(): void{
    ApiMessage.edit(ChatHub.selectChat.Storage.id, this.TargetMessage, this.TextContent);
    this.eventCancelEditMessage();
  }

  eventCopyMessageText(): void{
    // tslint:disable-next-line:triple-equals
    const message = this.getHubSelectChat().MessageList.find(p => p.id == this.TargetMessage);
    copyToClipboard(message.textContent);
  }

  eventCopyMessage(): void{
    // tslint:disable-next-line:triple-equals
    const message = this.getHubSelectChat().MessageList.find(p => p.id == this.TargetMessage);
    copyToClipboard(`${message.sender.nickname}\t${message.sendDate}\t:\n${message.textContent}`);
  }

  eventDeleteMessage(): void{
    ApiMessage.delete(ChatHub.selectChat.Storage.id, this.TargetMessage);
  }

  openDetailInfo(): void{
    const response = ApiStorage.getType(ChatHub.selectChat.Storage.id);
    if (response.type === 'SAVED_MESSAGES')
    {
      return;
    }
    if (response.type === 2){
      this.routingUrl = 'chat/user/info/' + response.userId;
    }else {
      this.routingUrl = 'chat/storage/info/' + this.getHubSelectChat().Storage.id + '/userlist/' + this.getHubSelectChat().Storage.id;
    }
    this.router.navigate([this.routingUrl]);
  }

  eventBackToContacts(): void{
    ChatHub.selectChat = null;
  }
}
