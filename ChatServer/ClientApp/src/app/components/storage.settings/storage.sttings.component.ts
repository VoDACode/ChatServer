import {Component, Input} from '@angular/core';
import {PermissionsTemplateModel} from '../../models/PermissionsTemplateModel';
import {UserModel} from '../../models/UserModel';
import {Convert, copyToClipboard, DateAddon} from '../../services/CustomClass';
import {ChatModel} from '../../models/ChatModel';
import {ChatHub} from '../../services/app.service.signalR';
import {StorageModel} from '../../models/StorageModel';

@Component({
  selector: 'app-storage-settings',
  templateUrl: './storage.settings.html'
})

export class StorageSttingsComponent {
  IsVisible = false;
  selectColor = 'rgba(114, 171, 255, 0.5)';
  //
  menuTemplateArr: Array<boolean> = new Array<boolean>();
  isMainRole = true;
  isCreateNewRole = false;
  isChangeMainSettings = false;

  constructor() {
    this.getSelectChat();
    this.getSelectPermissionsTemplateItem();
    this.menuTemplateArr[0] = true;
  }

  get isViewRolePage(): boolean{
    return ChatHub.selectChat.youPermissionsTemplateList.find(p => p.isCreateRoles || p.isDeleteRoles || p.isEditRoles) !== null;
  }
  get isViewJoinURLsPage(): boolean{
    return ChatHub.selectChat.youPermissionsTemplateList.find(p => p.isCopyJoinURL || p.isGenerateJoinURL || p.isDeleteJoinURL) !== null;
  }
  get isViewBanPage(): boolean{
    return ChatHub.selectChat.youPermissionsTemplateList.find(p => p.isBanUser) !== null;
  }
  get isViewLogPage(): boolean{
    return ChatHub.selectChat.youPermissionsTemplateList.find(p => p.isReadLog) !== null;
  }
  get isViewMainPage(): boolean{
    return ChatHub.selectChat.youPermissionsTemplateList.find(p => p.isRenameStorage || p.isEditTitleImage || p.isCanViewSettings) !== null;
  }

  get isViewDeleteJoin(): boolean{
    return ChatHub.selectChat.youPermissionsTemplateList.find(p => p.isDeleteJoinURL) !== null;
  }

  selectMenuItem(item: number): void{
    for (let i = 0; i < this.menuTemplateArr.length; i++){
      this.menuTemplateArr[i] = false;
    }
    this.menuTemplateArr[item] = true;
    if (item === 1){
      const res = ChatHub.authorizationService.http(`api/storage/permission/list?sID=${this.getSelectChat().Storage.id}`, 'GET');
      console.log(res);
      this.getSelectChat().PermissionsTemplateList = res;
      this.getSelectChat().PermissionsTemplateList[0].isSelected = true;
    }else if (item === 2){
      const res = ChatHub.authorizationService.http(`api/storage/join/list?sId=${ChatHub.selectChat.Storage.id}`, 'GET');
      this.getSelectChat().JoinLinks = res;
      console.log(res);
    }
  }

  selectPermissionsTemplateItem(selectedItem: number): void{
    if (this.isCreateNewRole){
      return;
    }
    for (let i = 0; i < this.getSelectChat().PermissionsTemplateList.length; i++) {
      if (i === selectedItem){
        this.getSelectChat().PermissionsTemplateList[i].isSelected = true;
        this.isMainRole = this.getSelectChat().PermissionsTemplateList[i].isMainRole;
      }else {
        this.getSelectChat().PermissionsTemplateList[i].isSelected = false;
      }
    }
  }
  getSelectPermissionsTemplateItem(): ModelPermissionsTemplate{
    const res = this.getSelectChat().PermissionsTemplateList.find(obj => obj.isSelected);
    return (!res) ? new ModelPermissionsTemplate() : res;
  }
  getSelectChat(): ChatModel{
    return ChatHub.selectChat;
  }
  setPermissionParam(obj: any): void{
    this.getSelectPermissionsTemplateItem().template[obj.parameter] = obj.val;
  }
  setPrivate(obj: any): void{
    this.getSelectChat().Storage[obj.parameter] = obj.val;
  }

  createNewRole(): void{
    if (this.isCreateNewRole){
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
  createNewJoinURL(): void{
    const res = ChatHub.authorizationService.http(`api/storage/join/create?sId=${ChatHub.selectChat.Storage.id}`, 'GET');
    ChatHub.selectChat.JoinLinks.push(res);
  }

  saveNewRole(): void{
    const createModel = ChatHub.selectChat.PermissionsTemplateList[ChatHub.selectChat.PermissionsTemplateList.length - 1].template;
    const query = `api/storage/permission/create?sID=${ChatHub.selectChat.Storage.id}&templateModel=${JSON.stringify(new SendPermissionsTemplateModel(createModel))}`;
    const res = ChatHub.authorizationService.http(query, 'POST');
    if (res.id){
      this.isCreateNewRole = false;
      ChatHub.selectChat.PermissionsTemplateList[ChatHub.selectChat.PermissionsTemplateList.length - 1].template.id = res.id;
    }else {
      this.cancelNewRole();
    }
  }
  cancelNewRole(): void{
    this.isCreateNewRole = false;
    ChatHub.selectChat.PermissionsTemplateList.pop();
    this.selectPermissionsTemplateItem(ChatHub.selectChat.PermissionsTemplateList.length - 1);
  }

  deleteJoinURL(key: string): void{
    const res = ChatHub.authorizationService.http(`api/storage/join/delete?sId=${ChatHub.selectChat.Storage.id}&key=${key}`, 'DELETE');
    if (res){
      console.error(res);
      return;
    }
    const deleteIndex = this.getSelectChat().JoinLinks.indexOf(this.getSelectChat().JoinLinks.find(k => k.key === key));
    this.getSelectChat().JoinLinks.splice(deleteIndex, 1);
  }
  deleteRole(): void{
    const selectItem = this.getSelectChat().PermissionsTemplateList.find(obj => obj.isSelected);
    const queryResult = ChatHub.authorizationService.http(`api/storage/permission/delete?sID=${ChatHub.selectChat.Storage.id}&pID=${selectItem.template.id}`, 'DELETE');
    if (!queryResult){
      this.selectMenuItem(1);
      return;
    }
    console.error(queryResult.errorText);
  }

  saveChangesRole(): void{
    const selectRole = ChatHub.selectChat.PermissionsTemplateList.find(p => p.isSelected).template;
    const queryResult = ChatHub.authorizationService.http(`api/storage/permission/edit?sID=${ChatHub.selectChat.Storage.id}&templateModel=${JSON.stringify(new SendPermissionsTemplateModel(selectRole))}`, 'POST');
    if (!queryResult){
      return;
    }
    console.error(queryResult.errorText);
  }

  onChangeMainSettings(): void{
    this.isChangeMainSettings = true;
  }
  onSaveMainChanges(): void{
    const queryString = `api/storage/edit?sID=${this.getSelectChat().Storage.id}&name=${this.getSelectChat().Storage.name}&UName=${this.getSelectChat().Storage.uniqueName}&IsPrivate=${this.getSelectChat().Storage.isPrivate}`;
    const queryResult = ChatHub.authorizationService.http(queryString, 'POST');
    this.isChangeMainSettings = false;
    if (!queryResult){
      return;
    }
    console.error(queryResult.errorText);
  }

  copyJoinLink(key: string): void{
    copyToClipboard(`${location.protocol}//${location.host}/storage/join/${key}`);
  }
}
export class SendPermissionsTemplateModel{
  constructor(Template: PermissionsTemplateModel) {
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

  Id = 0;
  Name = '';
  // Roles
  IsDeleteRoles = false;
  IsCreateRoles = false;
  IsEditRoles = false;
  // Users
  IsKickUser = false;
  IsBanUser = false;
  IsMuteUser = false;
  // Messages
  IsSendMessage = false;
  IsDeleteMessages = false;
  IsSendFiles = false;
  //
  IsGenerateJoinURL = false;
  IsCopyJoinURL = false;
  IsDeleteJoinURL = false;
  // storage
  IsCanEditSettings = false;
  IsCanViewSettings = false;
  IsRenameStorage = false;
  IsDeleteStorage = false;
  IsEditTitleImage = false;
  IsReadLog = false;
}
export class ModelPermissionsTemplate{
  isSelected = false;
  isMainRole = false;
  template: PermissionsTemplateModel = new PermissionsTemplateModel();
}
export class ModelJoinLink{
  id: string;
  userCreator: UserModel = new UserModel();
  key: string;
  createDate: string;
}
export class ModelBad{
  User: UserModel = new UserModel();
  StartDate: Date;
  EndDate: Date;
  Reason: string;
  FormatDate(obj, template = 'YYYY.MM.DD hh:mm:ss'): string{
    return DateAddon.Format(obj, template);
  }
  Duration(): string{
    const sD = new Date(this.StartDate);
    const eD = new Date(this.EndDate);
    const resD = new Date(eD.getMilliseconds() - sD.getMilliseconds());
    let res = (resD.getFullYear() - 1970 > 0) ? DateAddon.Format(resD) : '';
    if (resD.getFullYear() - 1970 === 0) {
      res = (resD.getMonth() > 0) ? DateAddon.Format(resD, 'MM.DD hh:mm:ss') : '';
    }
    if (resD.getMonth() === 0){
      res = (resD.getDate() > 0) ? DateAddon.Format(resD, 'DD hh:mm:ss') : '';
    }
    if (resD.getDate() === 0){
      res = DateAddon.Format(resD, 'hh:mm:ss');
    }
    return res;
  }
}
export class ModelLog{
  CareateDate: Date;
  User: UserModel = new UserModel();
  Content: string;
  FormatDate(obj, template = 'YYYY.MM.DD hh:mm:ss'): string{
    return DateAddon.Format(obj, template);
  }
}
