import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ChatModel} from '../../../models/ChatModel';
import {ChatHub} from '../../../services/app.service.signalR';

@Component({
  selector: 'app-storage-settings-ban',
  templateUrl: 'ban.settings.component.html'
})
export class BanSettingsComponent{
  constructor(private route: ActivatedRoute) {
    route.params.subscribe((params) => {

    });
  }
  getSelectChat(): ChatModel{
    return ChatHub.selectChat;
  }
}
