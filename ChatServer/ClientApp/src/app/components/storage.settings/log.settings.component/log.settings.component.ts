import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ChatModel} from '../../../models/ChatModel';
import {ChatHub} from '../../../services/app.service.signalR';

@Component({
  selector: 'app-storage-settings-log',
  templateUrl: 'log.settings.component.html'
})
export class LogSettingsComponent{
  constructor(private route: ActivatedRoute) {
    route.params.subscribe((params) => {

    });
  }
  getSelectChat(): ChatModel{
    return ChatHub.selectChat;
  }
}
