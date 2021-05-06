import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { ChatHub } from '../services/app.service.signalR';
let DetailInfoAboutStorageComponent = class DetailInfoAboutStorageComponent {
    constructor() {
        this.IsVisible = false;
    }
    get IsCanViewSettings() {
        return true;
    }
    get getSelectChat() {
        return ChatHub.selectChat;
    }
};
DetailInfoAboutStorageComponent = __decorate([
    Component({
        selector: 'app-detail-info-storage',
        templateUrl: '../source/html/menu/detail.Info.About.Storage.html'
    })
], DetailInfoAboutStorageComponent);
export { DetailInfoAboutStorageComponent };
//# sourceMappingURL=detail.Info.About.Storage.js.map