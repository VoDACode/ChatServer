import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { UserModel } from './models/UserModel';
import { ChatHub } from './services/app.service.signalR';
import * as $ from 'jquery';
import { Convert, Network } from './CustomClass';
let AppMenuComponent = class AppMenuComponent {
    constructor() {
        this.ViewUser = new UserModel();
        this.ViewUser.nickname = this.getUserData().nickname;
        this.ViewUser.userName = this.getUserData().userName;
        this.ViewUser.email = this.getUserData().email;
        this.ViewUser.imgContent = this.getUserData().imgContent;
    }
    getUserData() {
        return ChatHub.User;
    }
    LogOutUser() {
        ChatHub.authorizationService.logOut();
    }
    openUserSettingsWindow() {
        $('#UserSettingsWindow').show();
        $('#LeftTabMenu').animate({
            left: '-25%'
        }, 500);
    }
    openSelectUserTitleImg() {
        $('#selectUserTitleImg').click();
    }
    SaveUserSetting() {
        const expEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        // @ts-ignore
        const file = document.querySelector('#selectUserTitleImg').files[0];
        if (file) {
            console.log('Start upload img');
            Convert.FileToBase64(file, (res) => {
                ChatHub.User.imgContent = res;
                this.ViewUser.imgContent = res;
                console.log('Done convert!');
                console.log(res);
                Network.UploadFile('api/user/my/img/set', file, 'img');
            });
        }
        if (this.ViewUser.userName !== this.getUserData().userName) {
            ChatHub.authorizationService.http(`api/user/my/username/set?val=${this.ViewUser.userName}`, 'POST');
        }
        if (this.ViewUser.nickname !== this.getUserData().nickname) {
            ChatHub.authorizationService.http(`api/user/my/nickname/set?val=${this.ViewUser.nickname}`, 'POST');
        }
        if (this.ViewUser.email !== this.getUserData().email && expEmail.test(this.ViewUser.email)) {
            ChatHub.authorizationService.http(`api/user/my/email/set?val=${this.ViewUser.email}`, 'POST');
        }
        $('#UserSettingsWindow').hide();
    }
    OpenSetPasswordMenu() {
        ChatHub.IsSetPassword = true;
    }
};
AppMenuComponent = __decorate([
    Component({
        selector: 'app-menu-source',
        templateUrl: 'source/html/menu.components.html',
    })
], AppMenuComponent);
export { AppMenuComponent };
//# sourceMappingURL=app.menu.component.js.map