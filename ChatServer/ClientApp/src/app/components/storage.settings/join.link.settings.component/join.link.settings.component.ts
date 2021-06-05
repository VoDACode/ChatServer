import {Component} from '@angular/core';
import {ChatHub} from '../../../services/app.service.signalR';
import {copyToClipboard} from '../../../services/CustomClass';
import {ChatModel} from '../../../models/ChatModel';
import {ApiStorageJoin} from '../../../services/Api/ApiStorageJoin';

@Component({
  selector: 'app-storage-settings-join-link',
  templateUrl: 'join.link.settings.component.html'
})
export class JoinLinkSettingsComponent{
  constructor() {
      this.getSelectChat().JoinLinks = ApiStorageJoin.list(ChatHub.selectChat.Storage.id);
  }
  get isViewCreateJoin(): boolean{
    return ChatHub.selectChat.youPermissionsTemplateList.find(p => p.isCreateRoles) !== null;
  }
  get isViewDeleteJoin(): boolean{
    return ChatHub.selectChat.youPermissionsTemplateList.find(p => p.isDeleteJoinURL) !== null;
  }
  getSelectChat(): ChatModel{
    return ChatHub.selectChat;
  }
  createNewJoinURL(): void{
    const res = ApiStorageJoin.create(ChatHub.selectChat.Storage.id);
    if (!res.errorText) {
      ChatHub.selectChat.JoinLinks.push(res);
    }
  }
  deleteJoinURL(key: string): void{
    const res = ApiStorageJoin.delete(ChatHub.selectChat.Storage.id, key);
    if (res.errorText){
      console.error(res);
      return;
    }
    const deleteIndex = this.getSelectChat().JoinLinks.indexOf(this.getSelectChat().JoinLinks.find(k => k.key === key));
    this.getSelectChat().JoinLinks.splice(deleteIndex, 1);
  }
  copyJoinLink(key: string): void{
    copyToClipboard(`${location.protocol}//${location.host}/join/${key}`);
  }
}
