import {Component} from '@angular/core';
import {MessageCreateViewModel, MessageModel} from '../../models/MessageModel';
import {Location} from '@angular/common';
import {ChatHub} from '../../services/app.service.signalR';
import {ChatModel} from '../../models/ChatModel';
import * as $ from 'jquery';
import {StorageType} from '../../models/StorageModel';
import {copyToClipboard} from '../../services/CustomClass';

@Component({
  selector: `app-message-region`,
  templateUrl: './message.region.component.html'
})

export class AppMessageRegionComponent {
  get IsVisible(): boolean{
    return ChatHub.selectChat.Storage.id != null;
  }
  TextContent = '';
  SelectFile: any;
  IsDeleteMessage = true;
  IsEditMessage = true;
  IsEditMode = false;
  get IsChannel(): boolean{
    return this.getHubSelectChat().Storage.type === StorageType.Channel;
  }
  get TargetMessage(): string{
    return $('#MessageMenu').attr('target-message');
  }
  private location: Location;
  constructor(local: Location) {
    this.location = local;
  }
  sendMessage(): void{
    if (this.TextContent === '' && this.SelectFile === null) {
      return;
    }
    if (!this.IsEditMode) {
      // @ts-ignore
      ChatHub.sendMessage(this.TextContent, document.querySelector('#input-SelectFiles').files[0]);
      this.TextContent = '';
      this.SelectFile = null;
    }else {
      this.eventSaveEditMessage();
    }
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
    const res = ChatHub.authorizationService.http(`api/storage/user/list?sId=${ChatHub.selectChat.Storage.id}`, 'POST');
    ChatHub.selectChat.UsersList = res;
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
    const query = `api/message/edit?sID=${ChatHub.selectChat.Storage.id}&mID=${this.TargetMessage}&newText=${this.TextContent}`;
    ChatHub.authorizationService.http(query, 'POST');
    this.eventCancelEditMessage();
  }

  eventCopyMessage(): void{
    // tslint:disable-next-line:triple-equals
    const message = this.getHubSelectChat().MessageList.find(p => p.id == this.TargetMessage);
    copyToClipboard(`${message.sender.nickname}\t${message.sendDate}\t:\n${message.textContent}`);
  }

  eventDeleteMessage(): void{
    ChatHub.authorizationService.http(`api/message/delete?sID=${this.getHubSelectChat().Storage.id}&mID=${this.TargetMessage}`, 'POST');
  }
}
