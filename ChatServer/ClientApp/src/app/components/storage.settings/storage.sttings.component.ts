import {Component} from '@angular/core';
import {PermissionsTemplateModel} from '../../models/PermissionsTemplateModel';
import {UserModel} from '../../models/UserModel';
import {DateAddon} from '../../services/CustomClass';
import {ChatHub} from '../../services/app.service.signalR';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-storage-settings',
  templateUrl: './storage.settings.html'
})

export class StorageSttingsComponent {
  IsVisible = true;
  selectColor = 'rgba(114, 171, 255, 0.5)';
  get selectStorageId(): string{
    return ChatHub.selectChat.Storage.id;
  }
  //
  menuTemplateArr: Array<boolean> = new Array<boolean>();

  constructor(private router: Router) {
    console.log(ChatHub.selectChat);
    if (ChatHub.selectChat.Storage.id === '') {
      router.navigate(['/']);
    }
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

  selectMenuItem(item: number): void{
    for (let i = 0; i < this.menuTemplateArr.length; i++){
      this.menuTemplateArr[i] = false;
    }
    this.menuTemplateArr[item] = true;
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
