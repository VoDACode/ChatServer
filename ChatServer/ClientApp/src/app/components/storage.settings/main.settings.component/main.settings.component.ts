import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ChatModel} from '../../../models/ChatModel';
import {ChatHub} from '../../../services/app.service.signalR';

@Component({
  selector: 'app-storage-settings-main',
  templateUrl: 'main.settings.component.html'
})
export class MainSettingsComponent{
  isChangeMainSettings = false;
  constructor(private route: ActivatedRoute) {
    route.params.subscribe((params) => {

    });
  }
  getSelectChat(): ChatModel{
    return ChatHub.selectChat;
  }
  onChangeMainSettings(): void{
    this.isChangeMainSettings = true;
  }
  setPrivate(obj: any): void{
    this.getSelectChat().Storage[obj.parameter] = obj.val;
  }
  onSaveMainChanges(): void{
    const queryString = `api/storage/edit?sID=${this.getSelectChat().Storage.id}&name=${this.getSelectChat().Storage.name}&UName=${this.getSelectChat().Storage.uniqueName}&IsPrivate=${this.getSelectChat().Storage.isPrivate}`;
    const queryResult = ChatHub.authorizationService.http(queryString, 'POST');
    this.isChangeMainSettings = false;
    if (!queryResult){
      return;
    }
    console.error(queryResult.errorText);
  }

}
