import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ChatModel} from '../../../models/ChatModel';
import {ChatHub} from '../../../services/app.service.signalR';
import {ApiStorage} from '../../../services/Api/ApiStorage';

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
    const queryResult = ApiStorage.edit(this.getSelectChat().Storage);
    this.isChangeMainSettings = false;
    if (!queryResult){
      return;
    }
    console.error(queryResult.errorText);
  }

}
