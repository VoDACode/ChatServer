import { __awaiter, __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { ChatHub } from './app.service.signalR';
import { Convert } from '../CustomClass';
let AuthorizationService = class AuthorizationService {
    constructor(router, cookieService) {
        this.cookieService = cookieService;
        this.uri = 'api';
        this.tokenName = 'auth_token';
        this.router = router;
    }
    get ConfirmEmailProcess() {
        return this.cookieService.check('confirm_key');
    }
    get token() {
        return (this.logIn) ? this.cookieService.get(this.tokenName) : null;
    }
    get logIn() {
        return this.cookieService.check(this.tokenName);
    }
    get IsValidToken() {
        const res = this.http(`${this.uri}/account/isAuthorize`, 'get');
        return (!res) ? false : res.status;
    }
    UpdateUserInfo() {
        const res = this.http(`${this.uri}/user/my`, 'get');
        ChatHub.User.nickname = res.nickname;
        ChatHub.User.userName = res.userName;
        ChatHub.User.email = res.email;
        ChatHub.User.deleteIfMissingFromMonths = res.deleteIfMissingFromMonths;
        if (res.imgContent !== null) {
            ChatHub.User.imgContent = res.imgContent;
        }
        else {
            Convert.toDataURL('assets/imgs/default-user-avatar-96.png', (resCall) => {
                ChatHub.User.imgContent = resCall;
            });
        }
    }
    login(email, password, callBack) {
        return __awaiter(this, void 0, void 0, function* () {
            $.post(`${this.uri}/account/authenticate?email=${email}&password=${password}`, (resp) => {
                console.log(resp);
                this.cookieService.set(this.tokenName, resp.token);
                callBack((resp.token !== null));
            });
        });
    }
    logOut() {
        this.http(`${this.uri}/account/logout`, 'DELETE');
    }
    http(URL, Type, Async = false) {
        const response = $.ajax({
            url: URL,
            type: Type,
            async: Async,
            headers: {
                Accept: 'application/json',
                Authorization: 'Bearer ' + this.token
            },
            dataType: 'json'
        });
        return response.responseJSON;
    }
};
AuthorizationService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], AuthorizationService);
export { AuthorizationService };
//# sourceMappingURL=Authorization.Service.js.map