import {Component} from '@angular/core';
import {UserModel} from '../../models/UserModel';
import {ChatHub} from '../../services/app.service.signalR';
import * as $ from 'jquery';
import {Convert, Network} from '../../services/CustomClass';
import {Router} from '@angular/router';
import {VisualService} from '../../services/visual.service';
import {ApiUser} from '../../services/Api/ApiUser';

@Component({
  selector: 'app-menu-source',
  templateUrl: 'menu.components.html',
})

// tslint:disable-next-line:component-class-suffix
export class MenuComponents {
  ViewUser: UserModel = new UserModel();
  constructor(private router: Router) {
    this.ViewUser.nickname = this.getUserData().nickname;
    this.ViewUser.userName = this.getUserData().userName;
    this.ViewUser.email = this.getUserData().email;
    this.ViewUser.imgContent = this.getUserData().imgContent;
  }
  getUserData(): UserModel{
    return ChatHub.User;
  }
  LogOutUser(): void{
    // ChatHub.authorizationService.logOut();
    this.router.navigate(['/']);
  }
  openUserSettingsWindow(): void{
    $('#UserSettingsWindow').show();
    $('#LeftTabMenu').animate({
      left: '-25%'
    }, 500);
  }
  openSelectUserTitleImg(): void{
    $('#selectUserTitleImg').click();
  }
  SaveUserSetting(): void{
    const expEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // @ts-ignore
    const file = document.querySelector('#selectUserTitleImg').files[0];
    if (file){
      Convert.FileToBase64(file, (res) => {
        ChatHub.User.imgContent = res;
        this.ViewUser.imgContent = res;
        ApiUser.setMyImage(file);
      });
    }
    if (this.ViewUser.userName !== this.getUserData().userName){
      ApiUser.setMyUserName(this.ViewUser.userName);
    }
    if (this.ViewUser.nickname !== this.getUserData().nickname){
      ApiUser.setMyNickname(this.ViewUser.nickname);
    }
    if (this.ViewUser.email !== this.getUserData().email && expEmail.test(this.ViewUser.email)){
      ApiUser.setMyEmail(this.ViewUser.email);
    }
    $('#UserSettingsWindow').hide();
  }

  close(): void{
    $('#LeftTabMenu').animate({
      left: `-${new VisualService().IsMobile ? '75' : '25'}%`
    }, 500);
  }
}
