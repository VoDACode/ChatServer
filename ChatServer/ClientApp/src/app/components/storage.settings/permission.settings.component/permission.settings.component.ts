import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ChatHub} from '../../../services/app.service.signalR';
import {ModelPermissionsTemplate, SendPermissionsTemplateModel} from '../storage.sttings.component';
import {ChatModel} from '../../../models/ChatModel';
import {ApiStoragePermission} from '../../../services/Api/ApiStoragePermission';

@Component({
  selector: 'app-storage-settings-permission',
  templateUrl: 'permission.settings.component.html'
})
export class PermissionSettingsComponent{
  selectColor = 'rgba(114, 171, 255, 0.5)';
  isCreateNewRole = false;
  isMainRole = true;
  constructor(private router: Router) {
    if (ChatHub.selectChat.Storage.id === '') {
      router.navigate(['/']);
    }
    this.getSelectChat().PermissionsTemplateList = ApiStoragePermission.getList(this.getSelectChat().Storage.id);
    this.getSelectPermissionsTemplateItem();
  }
  getSelectChat(): ChatModel{
    return ChatHub.selectChat;
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
  deleteRole(): void{
    const selectItem = this.getSelectChat().PermissionsTemplateList.find(obj => obj.isSelected);
    const queryResult = ApiStoragePermission.delete(ChatHub.selectChat.Storage.id, selectItem.template.id);
    if (!queryResult.errorText){
      this.getSelectChat().PermissionsTemplateList = ApiStoragePermission.getList(this.getSelectChat().Storage.id);
      this.getSelectChat().PermissionsTemplateList[0].isSelected = true;
      return;
    }
    console.error(queryResult.errorText);
  }
  saveChangesRole(): void{
    const selectRole = ChatHub.selectChat.PermissionsTemplateList.find(p => p.isSelected).template;
    const queryResult = ApiStoragePermission.edit(ChatHub.selectChat.Storage.id, selectRole);
    if (!queryResult){
      return;
    }
    console.error(queryResult.errorText);
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
  setPermissionParam(obj: any): void{
    this.getSelectPermissionsTemplateItem().template[obj.parameter] = obj.val;
  }

  saveNewRole(): void{
    const createModel = ChatHub.selectChat.PermissionsTemplateList[ChatHub.selectChat.PermissionsTemplateList.length - 1].template;
    const res = ApiStoragePermission.create(ChatHub.selectChat.Storage.id, createModel);
    console.log(res);
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
}
