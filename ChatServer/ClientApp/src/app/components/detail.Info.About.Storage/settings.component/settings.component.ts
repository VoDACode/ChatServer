import {Component} from '@angular/core';
import {ChatHub} from '../../../services/app.service.signalR';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-detail-storage-info-settings',
  templateUrl: 'settings.component.html'
})
export class DetailStorageSettingsComponent{
  constructor(private route: ActivatedRoute) {
    route.params.subscribe(params => {
      $('#Modal_swich_userList').css('border-bottom', 'none');
      $('#Modal_swich_setting').css('border-bottom', '2px solid rgb(76, 93, 110)');
    });
  }

  eventLeaveStorage(): void{
    const query = `api/storage/leave?sId=${ChatHub.selectChat.Storage.id}`;
    ChatHub.authorizationService.http(query, 'POST');
  }
}
