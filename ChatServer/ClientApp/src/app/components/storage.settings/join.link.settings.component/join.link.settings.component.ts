import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ChatHub} from '../../../services/app.service.signalR';
import {copyToClipboard} from '../../../services/CustomClass';
import {ChatModel} from '../../../models/ChatModel';

@Component({
  selector: 'app-storage-settings-join-link',
  templateUrl: 'join.link.settings.component.html'
})
export class JoinLinkSettingsComponent{
  constructor(private route: ActivatedRoute) {
    route.params.subscribe((params) => {
      const res = ChatHub.authorizationService.http(`api/storage/join/list?sId=${ChatHub.selectChat.Storage.id}`, 'GET');
      this.getSelectChat().JoinLinks = res;
      console.log(res);
    });
  }
  get isViewDeleteJoin(): boolean{
    return ChatHub.selectChat.youPermissionsTemplateList.find(p => p.isDeleteJoinURL) !== null;
  }
  getSelectChat(): ChatModel{
    return ChatHub.selectChat;
  }
  createNewJoinURL(): void{
    const res = ChatHub.authorizationService.http(`api/storage/join/create?sId=${ChatHub.selectChat.Storage.id}`, 'GET');
    ChatHub.selectChat.JoinLinks.push(res);
  }
  deleteJoinURL(key: string): void{
    const res = ChatHub.authorizationService.http(`api/storage/join/delete?sId=${ChatHub.selectChat.Storage.id}&key=${key}`, 'DELETE');
    if (res){
      console.error(res);
      return;
    }
    const deleteIndex = this.getSelectChat().JoinLinks.indexOf(this.getSelectChat().JoinLinks.find(k => k.key === key));
    this.getSelectChat().JoinLinks.splice(deleteIndex, 1);
  }
  copyJoinLink(key: string): void{
    copyToClipboard(`${location.protocol}//${location.host}/storage/join/${key}`);
  }
}
