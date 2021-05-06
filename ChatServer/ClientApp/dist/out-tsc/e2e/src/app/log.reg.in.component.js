import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { UserModel } from './models/UserModel';
import { ChatHub } from './services/app.service.signalR';
let LogRegInComponent = class LogRegInComponent {
    constructor(cookie) {
        this.cookie = cookie;
        this.User = new UserModel();
        this.Password = '';
        this.ConfirmPassword = '';
        this.IsVisibleRegIn = true;
        this.IsValid = true;
    }
    ViewRegIn(val) {
        this.IsVisibleRegIn = val;
    }
    actionLogIn() {
        const expEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const expPassword = /[0-9a-z]+/i;
        console.log('TP - ' + expPassword.test(this.Password));
        console.log('TE - ' + expEmail.test(String(this.User.email).toLowerCase()));
        if (!expPassword.test(this.Password) ||
            !expEmail.test(String(this.User.email).toLowerCase())) {
            this.PrintWarning('T - Wrong login or password!');
        }
        if (this.IsValid) {
            ChatHub.authorizationService.login(this.User.email, this.Password, (status) => {
                if (!status) {
                    this.PrintWarning('C - Wrong login or password!');
                }
            });
        }
        this.IsValid = true;
    }
    actionRegIn() {
        document.getElementById('WarningBox').innerHTML = '';
        const expNickname = /[a-z]{4,255}/i;
        const expEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const expPassword = /([0-9a-z]+){8,255}/i;
        if (!expNickname.test(this.User.nickname)) {
            this.PrintWarning('Incorrectly filled "Nickname" field!');
        }
        if (!expNickname.test(this.User.userName)) {
            this.PrintWarning('Incorrectly filled "User name" field!');
        }
        if (!expEmail.test(String(this.User.email).toLowerCase())) {
            this.PrintWarning('Incorrectly filled "email" field!');
        }
        if (!expPassword.test(this.Password) || this.Password.length < 8) {
            this.PrintWarning('Incorrectly filled "Password" field!');
        }
        if (this.Password !== this.ConfirmPassword) {
            this.PrintWarning('Passwords do not match!');
        }
        if (this.IsValid) {
            this.RegIn();
        }
    }
    PrintWarning(message) {
        this.IsValid = false;
        const obj = document.createElement('span');
        obj.innerHTML = message;
        document.getElementById('WarningBox').appendChild(obj);
        document.getElementById('WarningBox').innerHTML += '</br>';
    }
    RegIn() {
        $.post(`api/account/registration?email=${this.User.email}&password=${this.Password}&userName=${this.User.userName}&nickName=${this.User.nickname}`, (data) => {
            this.cookie.set('confirm_key', data.userKey);
        });
    }
};
LogRegInComponent = __decorate([
    Component({
        templateUrl: './source/html/log.reg.in.component.html',
        selector: 'app-reg-log'
    })
], LogRegInComponent);
export { LogRegInComponent };
//# sourceMappingURL=log.reg.in.component.js.map