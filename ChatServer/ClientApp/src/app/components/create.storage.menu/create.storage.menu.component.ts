import {Component} from '@angular/core';
import {ContactModel} from '../../models/ContactModel';
import {StorageType} from '../../models/StorageModel';
import {ChatHub} from '../../services/app.service.signalR';
import * as $ from 'jquery';

@Component({
  templateUrl: './create.storage.menu.html',
  selector: 'app-create-storage-menu'
})

export class CreateStorageMenuComponent {
  Storage: ContactModel = new ContactModel();

  IsViewMainPage = false;
  constructor() {
    this.Storage.imgContent = 'assets/imgs/plus-math-100.png';
    this.Storage.isPrivate = false;
  }
  IsGroup(): void{
    this.Storage.type = StorageType.Group;
    this.IsViewMainPage = true;
  }
  IsChannel(): void{
    this.Storage.type = StorageType.Channel;
    this.IsViewMainPage = true;
  }
  UpdateIsPrivate(event: any): void{
    this.Storage.isPrivate = event.val;
    if (this.Storage.isPrivate){
      this.Storage.uniqueName = '';
    }
    console.log(this.Storage);
  }
  createStorage(): void{
    const queryString = `api/storage/create?name=${this.Storage.name}&UName=${this.Storage.uniqueName}&IsPrivate=${this.Storage.isPrivate}&type=${this.Storage.type}`;
    document.getElementById('createStorageMenu').style.display = 'none';
    ChatHub.authorizationService.http(queryString , 'POST');
    this.Storage = new ContactModel();
    this.IsViewMainPage = false;
    $('#createStorageMenu').hide();
  }
}
