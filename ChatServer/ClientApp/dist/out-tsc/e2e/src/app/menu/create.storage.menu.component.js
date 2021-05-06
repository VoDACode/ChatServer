import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { ContactModel } from '../models/ContactModel';
import { StorageType } from '../models/StorageModel';
import { ChatHub } from '../services/app.service.signalR';
import * as $ from 'jquery';
let CreateStorageMenuComponent = class CreateStorageMenuComponent {
    constructor() {
        this.Storage = new ContactModel();
        this.IsViewMainPage = false;
        this.Storage.imgContent = 'assets/imgs/plus-math-100.png';
        this.Storage.isPrivate = false;
    }
    IsGroup() {
        this.Storage.type = StorageType.Group;
        this.IsViewMainPage = true;
    }
    IsChannel() {
        this.Storage.type = StorageType.Channel;
        this.IsViewMainPage = true;
    }
    UpdateIsPrivate(event) {
        this.Storage.isPrivate = event.val;
        if (this.Storage.isPrivate) {
            this.Storage.uniqueName = '';
        }
        console.log(this.Storage);
    }
    createStorage() {
        const queryString = `api/storage/create?connectionId=${ChatHub.ConnectionId}&name=${this.Storage.name}&UName=${this.Storage.uniqueName}&IsPrivate=${this.Storage.isPrivate}&type=${this.Storage.type}`;
        document.getElementById('createStorageMenu').style.display = 'none';
        ChatHub.authorizationService.http(queryString, 'POST');
        this.Storage = new ContactModel();
        this.IsViewMainPage = false;
        $('#createStorageMenu').hide();
    }
};
CreateStorageMenuComponent = __decorate([
    Component({
        templateUrl: '../source/html/menu/create.storage.menu.html',
        selector: 'app-create-storage-menu'
    })
], CreateStorageMenuComponent);
export { CreateStorageMenuComponent };
//# sourceMappingURL=create.storage.menu.component.js.map