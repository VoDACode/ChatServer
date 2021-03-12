import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ChatHub} from '../../../services/app.service.signalR';

@Component({
  selector: 'app-user-storage-list',
  templateUrl: 'user.list.component.html'
})
export class UserListComponent {
  UsersList: any;
  constructor(private route: ActivatedRoute) {
    route.params.subscribe(params => {
      this.UsersList = ChatHub.authorizationService.http(`api/storage/user/list?sId=${params.id}`, 'POST');
      $('#Modal_swich_setting').css('border-bottom', 'none');
      $('#Modal_swich_userList').css('border-bottom', '2px solid rgb(76, 93, 110)');
    });
  }
}
