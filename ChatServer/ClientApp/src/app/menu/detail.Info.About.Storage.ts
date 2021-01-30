import {Component} from '@angular/core';
import {ChatHub} from '../services/app.service.signalR';
import {ChatModel} from '../models/ChatModel';

@Component({
  selector: 'app-detail-info-storage',
  templateUrl: '../source/html/menu/detail.Info.About.Storage.html'
})

export class DetailInfoAboutStorageComponent{
  IsVisible = false;
  get IsCanViewSettings(): boolean{
    return true;
  }
  get getSelectChat(): ChatModel{
    return ChatHub.selectChat;
  }
}
