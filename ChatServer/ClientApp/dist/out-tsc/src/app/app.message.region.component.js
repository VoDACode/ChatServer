import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { MessageCreateViewModel } from './models/MessageModel';
import { ChatHub } from './services/app.service.signalR';
import * as $ from 'jquery';
let AppMessageRegionComponent = class AppMessageRegionComponent {
    constructor(local) {
        this.IsVisible = true;
        this.TextContent = '';
        this.location = local;
    }
    sendMessage() {
        if (this.TextContent === '' && this.SelectFile === null) {
            return;
        }
        // @ts-ignore
        ChatHub.sendMessage(this.TextContent, document.querySelector('#input-SelectFiles').files[0]);
        this.TextContent = '';
        this.SelectFile = null;
    }
    getHubSelectChat() {
        return ChatHub.selectChat;
    }
    getHtmlContent(message) {
        return MessageCreateViewModel.getHtmlContent(message);
    }
    selectFile() {
        $('#input-SelectFiles').click();
    }
    onOpenDetailInfo() {
        $('#detailedInfoAboutStorage').show();
        const res = ChatHub.authorizationService.http(`api/storage/user/list?sId=${ChatHub.selectChat.Storage.id}`, 'GET');
        ChatHub.selectChat.UsersList = res;
    }
    openMessageContextMenu() {
        return false;
    }
};
AppMessageRegionComponent = __decorate([
    Component({
        selector: `app-message-region`,
        templateUrl: './source/html/message.region.component.html'
    })
], AppMessageRegionComponent);
export { AppMessageRegionComponent };
//# sourceMappingURL=app.message.region.component.js.map