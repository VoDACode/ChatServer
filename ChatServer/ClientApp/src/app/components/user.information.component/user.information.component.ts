import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {UserModel} from '../../models/UserModel';
import {ApiUser} from '../../services/Api/ApiUser';

@Component({
  selector: 'app-user-information',
  templateUrl: 'user.information.component.html'
})
export class UserInformationComponent{
  private isVisible = true;
  SelectId: string;
  SelectUser: UserModel = new UserModel();
  get IsVisible(): boolean{
    return this.isVisible;
  }

  constructor(private route: ActivatedRoute) {
    route.params.subscribe(params => {
      this.SelectId = params.id;
      this.SelectUser = ApiUser.getUser(params.id);
    });
  }

  eventClose(): void{
    this.isVisible = false;
  }
}
