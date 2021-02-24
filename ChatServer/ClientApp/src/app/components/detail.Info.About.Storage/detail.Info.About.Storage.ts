import {Component} from '@angular/core';
import {ChatHub} from '../../services/app.service.signalR';
import {ChatModel} from '../../models/ChatModel';

@Component({
  selector: 'app-detail-info-storage',
  templateUrl: './detail.Info.About.Storage.html'
})

export class DetailInfoAboutStorageComponent{
  get IsVisible(): boolean{
    return false;
  }

  get getSelectChat(): ChatModel{
    return ChatHub.selectChat;
  }

  openSettings(): void{
    $('#Modal_swich_userList').css('border-bottom', 'none');
    $('#Modal_swich_setting').css('border-bottom', '2px solid rgb(76, 93, 110)');
    $('#ListUsers_inStorage').hide();
    $('#SettingPanel').css('display', 'grid');
  }

  openUserList(): void{
    $('#Modal_swich_setting').css('border-bottom', 'none');
    $('#Modal_swich_userList').css('border-bottom', '2px solid rgb(76, 93, 110)');
    $('#ListUsers_inStorage').show();
    $('#SettingPanel').hide();
  }

  eventLeaveStorage(): void{
    const query = `api/storage/leave?connectionId=${ChatHub.ConnectionId}&sId=${ChatHub.selectChat.Storage.id}`;
    ChatHub.authorizationService.http(query, 'POST');
  }
}
