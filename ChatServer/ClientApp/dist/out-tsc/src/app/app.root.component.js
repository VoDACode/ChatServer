import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { ChatHub } from './services/app.service.signalR';
let AppRootComponent = class AppRootComponent {
    constructor() {
        this.IsDEBUG = false;
    }
    getAuthorization() {
        return ChatHub.authorizationService;
    }
    IsSetPassword() {
        return ChatHub.IsSetPassword;
    }
};
AppRootComponent = __decorate([
    Component({
        selector: `app-root`,
        templateUrl: './source/html/root.component.html'
    })
], AppRootComponent);
export { AppRootComponent };
//# sourceMappingURL=app.root.component.js.map