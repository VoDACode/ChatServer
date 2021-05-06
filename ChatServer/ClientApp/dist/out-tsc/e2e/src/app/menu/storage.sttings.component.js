import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { PermissionsTemplateModel } from '../models/PermissionsTemplateModel';
import { UserModel } from '../models/UserModel';
import { copyToClipboard, DateAddon } from '../CustomClass';
import { ChatHub } from '../services/app.service.signalR';
let StorageSttingsComponent = class StorageSttingsComponent {
    constructor() {
        this.IsVisible = false;
        this.selectColor = 'rgba(114, 171, 255, 0.5)';
        //
        this.menuTemplateArr = new Array();
        this.isMainRole = true;
        this.isCreateNewRole = false;
        this.isChangeMainSettings = false;
        this.getSelectChat();
        this.getSelectPermissionsTemplateItem();
        this.menuTemplateArr[0] = true;
    }
    get isViewRolePage() {
        return ChatHub.selectChat.youPermissionsTemplateList.find(p => p.isCreateRoles || p.isDeleteRoles || p.isEditRoles) !== null;
    }
    get isViewJoinURLsPage() {
        return ChatHub.selectChat.youPermissionsTemplateList.find(p => p.isCopyJoinURL || p.isGenerateJoinURL || p.isDeleteJoinURL) !== null;
    }
    get isViewBanPage() {
        return ChatHub.selectChat.youPermissionsTemplateList.find(p => p.isBanUser) !== null;
    }
    get isViewLogPage() {
        return ChatHub.selectChat.youPermissionsTemplateList.find(p => p.isReadLog) !== null;
    }
    get isViewMainPage() {
        return ChatHub.selectChat.youPermissionsTemplateList.find(p => p.isRenameStorage || p.isEditTitleImage || p.isCanViewSettings) !== null;
    }
    get isViewDeleteJoin() {
        return ChatHub.selectChat.youPermissionsTemplateList.find(p => p.isDeleteJoinURL) !== null;
    }
    selectMenuItem(item) {
        for (let i = 0; i < this.menuTemplateArr.length; i++) {
            this.menuTemplateArr[i] = false;
        }
        this.menuTemplateArr[item] = true;
        if (item === 1) {
            const res = ChatHub.authorizationService.http(`api/storage/permission/list?sID=${this.getSelectChat().Storage.id}`, 'GET');
            console.log(res);
            this.getSelectChat().PermissionsTemplateList = res;
            this.getSelectChat().PermissionsTemplateList[0].isSelected = true;
        }
        else if (item === 2) {
            const res = ChatHub.authorizationService.http(`api/storage/join/list?sId=${ChatHub.selectChat.Storage.id}`, 'GET');
            this.getSelectChat().JoinLinks = res;
            console.log(res);
        }
    }
    selectPermissionsTemplateItem(selectedItem) {
        if (this.isCreateNewRole) {
            return;
        }
        for (let i = 0; i < this.getSelectChat().PermissionsTemplateList.length; i++) {
            if (i === selectedItem) {
                this.getSelectChat().PermissionsTemplateList[i].isSelected = true;
                this.isMainRole = this.getSelectChat().PermissionsTemplateList[i].isMainRole;
            }
            else {
                this.getSelectChat().PermissionsTemplateList[i].isSelected = false;
            }
        }
    }
    getSelectPermissionsTemplateItem() {
        const res = this.getSelectChat().PermissionsTemplateList.find(obj => obj.isSelected);
        return (!res) ? new ModelPermissionsTemplate() : res;
    }
    getSelectChat() {
        return ChatHub.selectChat;
    }
    setPermissionParam(obj) {
        this.getSelectPermissionsTemplateItem().template[obj.parameter] = obj.val;
    }
    setPrivate(obj) {
        this.getSelectChat().Storage[obj.parameter] = obj.val;
    }
    createNewRole() {
        if (this.isCreateNewRole) {
            return;
        }
        const pt = new ModelPermissionsTemplate();
        pt.template.name = 'New role';
        pt.template.isCopyJoinURL = true;
        pt.template.isSendFiles = true;
        pt.template.isSendMessage = true;
        pt.template.isGenerateJoinURL = true;
        ChatHub.selectChat.PermissionsTemplateList.push(pt);
        this.selectPermissionsTemplateItem(ChatHub.selectChat.PermissionsTemplateList.length - 1);
        this.isCreateNewRole = true;
    }
    createNewJoinURL() {
        const res = ChatHub.authorizationService.http(`api/storage/join/create?sId=${ChatHub.selectChat.Storage.id}`, 'GET');
        ChatHub.selectChat.JoinLinks.push(res);
    }
    saveNewRole() {
        const createModel = ChatHub.selectChat.PermissionsTemplateList[ChatHub.selectChat.PermissionsTemplateList.length - 1].template;
        const query = `api/storage/permission/create?sID=${ChatHub.selectChat.Storage.id}&templateModel=${JSON.stringify(new SendPermissionsTemplateModel(createModel))}`;
        const res = ChatHub.authorizationService.http(query, 'POST');
        if (res.id) {
            this.isCreateNewRole = false;
            ChatHub.selectChat.PermissionsTemplateList[ChatHub.selectChat.PermissionsTemplateList.length - 1].template.id = res.id;
        }
        else {
            this.cancelNewRole();
        }
    }
    cancelNewRole() {
        this.isCreateNewRole = false;
        ChatHub.selectChat.PermissionsTemplateList.pop();
        this.selectPermissionsTemplateItem(ChatHub.selectChat.PermissionsTemplateList.length - 1);
    }
    deleteJoinURL(key) {
        const res = ChatHub.authorizationService.http(`api/storage/join/delete?sId=${ChatHub.selectChat.Storage.id}&key=${key}`, 'DELETE');
        if (res) {
            console.error(res);
            return;
        }
        const deleteIndex = this.getSelectChat().JoinLinks.indexOf(this.getSelectChat().JoinLinks.find(k => k.key === key));
        this.getSelectChat().JoinLinks.splice(deleteIndex, 1);
    }
    deleteRole() {
        const selectItem = this.getSelectChat().PermissionsTemplateList.find(obj => obj.isSelected);
        const queryResult = ChatHub.authorizationService.http(`api/storage/permission/delete?sID=${ChatHub.selectChat.Storage.id}&pID=${selectItem.template.id}`, 'DELETE');
        if (!queryResult) {
            this.selectMenuItem(1);
            return;
        }
        console.error(queryResult.errorText);
    }
    saveChangesRole() {
        const selectRole = ChatHub.selectChat.PermissionsTemplateList.find(p => p.isSelected).template;
        const queryResult = ChatHub.authorizationService.http(`api/storage/permission/edit?sID=${ChatHub.selectChat.Storage.id}&templateModel=${JSON.stringify(new SendPermissionsTemplateModel(selectRole))}`, 'POST');
        if (!queryResult) {
            return;
        }
        console.error(queryResult.errorText);
    }
    onChangeMainSettings() {
        this.isChangeMainSettings = true;
    }
    onSaveMainChanges() {
        const queryString = `api/storage/edit?sID=${this.getSelectChat().Storage.id}&name=${this.getSelectChat().Storage.name}&UName=${this.getSelectChat().Storage.uniqueName}&IsPrivate=${this.getSelectChat().Storage.isPrivate}`;
        const queryResult = ChatHub.authorizationService.http(queryString, 'POST');
        this.isChangeMainSettings = false;
        if (!queryResult) {
            return;
        }
        console.error(queryResult.errorText);
    }
    copyJoinLink(key) {
        copyToClipboard(`${location.protocol}//${location.host}/storage/join/${key}`);
    }
};
StorageSttingsComponent = __decorate([
    Component({
        selector: 'app-storage-settings',
        templateUrl: '../source/html/menu/storage.settings.html'
    })
], StorageSttingsComponent);
export { StorageSttingsComponent };
export class SendPermissionsTemplateModel {
    constructor(Template) {
        this.Id = 0;
        this.Name = '';
        // Roles
        this.IsDeleteRoles = false;
        this.IsCreateRoles = false;
        this.IsEditRoles = false;
        // Users
        this.IsKickUser = false;
        this.IsBanUser = false;
        this.IsMuteUser = false;
        // Messages
        this.IsSendMessage = false;
        this.IsDeleteMessages = false;
        this.IsSendFiles = false;
        //
        this.IsGenerateJoinURL = false;
        this.IsCopyJoinURL = false;
        this.IsDeleteJoinURL = false;
        // storage
        this.IsCanEditSettings = false;
        this.IsCanViewSettings = false;
        this.IsRenameStorage = false;
        this.IsDeleteStorage = false;
        this.IsEditTitleImage = false;
        this.IsReadLog = false;
        this.Name = Template.name;
        this.IsBanUser = Template.isBanUser;
        this.IsSendFiles = Template.isSendFiles;
        this.IsCanEditSettings = Template.isCanEditSettings;
        this.IsCanViewSettings = Template.isCanViewSettings;
        this.IsCopyJoinURL = Template.isCopyJoinURL;
        this.IsDeleteJoinURL = Template.isDeleteJoinURL;
        this.IsGenerateJoinURL = Template.isGenerateJoinURL;
        this.IsDeleteMessages = Template.isDeleteMessages;
        this.IsSendMessage = Template.isSendMessage;
        this.IsMuteUser = Template.isMuteUser;
        this.IsKickUser = Template.isKickUser;
        this.IsDeleteRoles = Template.isDeleteRoles;
        this.IsCreateRoles = Template.isCreateRoles;
        this.IsEditRoles = Template.isEditRoles;
        this.IsRenameStorage = Template.isRenameStorage;
        this.IsDeleteStorage = Template.isDeleteStorage;
        this.IsEditTitleImage = Template.isEditTitleImage;
        this.IsReadLog = Template.isReadLog;
        this.Id = Template.id;
    }
}
export class ModelPermissionsTemplate {
    constructor() {
        this.isSelected = false;
        this.isMainRole = false;
        this.template = new PermissionsTemplateModel();
    }
}
export class ModelJoinLink {
    constructor() {
        this.userCreator = new UserModel();
    }
}
export class ModelBad {
    constructor() {
        this.User = new UserModel();
    }
    FormatDate(obj, template = 'YYYY.MM.DD hh:mm:ss') {
        return DateAddon.Format(obj, template);
    }
    Duration() {
        const sD = new Date(this.StartDate);
        const eD = new Date(this.EndDate);
        const resD = new Date(eD.getMilliseconds() - sD.getMilliseconds());
        let res = (resD.getFullYear() - 1970 > 0) ? DateAddon.Format(resD) : '';
        if (resD.getFullYear() - 1970 === 0) {
            res = (resD.getMonth() > 0) ? DateAddon.Format(resD, 'MM.DD hh:mm:ss') : '';
        }
        if (resD.getMonth() === 0) {
            res = (resD.getDate() > 0) ? DateAddon.Format(resD, 'DD hh:mm:ss') : '';
        }
        if (resD.getDate() === 0) {
            res = DateAddon.Format(resD, 'hh:mm:ss');
        }
        return res;
    }
}
export class ModelLog {
    constructor() {
        this.User = new UserModel();
    }
    FormatDate(obj, template = 'YYYY.MM.DD hh:mm:ss') {
        return DateAddon.Format(obj, template);
    }
}
//# sourceMappingURL=storage.sttings.component.js.map