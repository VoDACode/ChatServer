import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { ChatHub } from './services/app.service.signalR';
let SetPasswordComponent = class SetPasswordComponent {
    constructor() {
        this.IsValid = true;
    }
    actionSetPassword() {
        const expPassword = /([0-9a-z]+){8,255}/i;
        this.IsValid = true;
        document.getElementById('WarningBox').innerHTML = '';
        if (this.NewPassword !== this.ConfirmNewPassword) {
            this.PrintWarning('Passwords do not match!');
        }
        if (!expPassword.test(this.NewPassword) && this.NewPassword.length < 8) {
            this.PrintWarning('Incorrectly filled "Password" field!');
        }
        if (this.IsValid) {
            const res = ChatHub.authorizationService.http(`api/user/my/password/set?newP=${this.NewPassword}&oldP=${this.OldPassword}`, 'POST');
            console.log(res);
            if (!res.errorText) {
                this.PrintWarning(res.errorText);
            }
            else {
                ChatHub.IsSetPassword = false;
            }
        }
    }
    PrintWarning(message) {
        this.IsValid = false;
        const obj = document.createElement('span');
        obj.innerHTML = message;
        document.getElementById('WarningBox').appendChild(obj);
        document.getElementById('WarningBox').innerHTML += '</br>';
    }
    actionClose() {
        ChatHub.IsSetPassword = false;
    }
};
SetPasswordComponent = __decorate([
    Component({
        selector: 'app-set-password',
        templateUrl: './source/html/set.password.page.html'
    })
], SetPasswordComponent);
export { SetPasswordComponent };
//# sourceMappingURL=set.password.component.js.map