import {EventEmitter} from '@angular/core';
import {ChatModel} from '../models/ChatModel';
import {MessageModel} from '../models/MessageModel';
import {Location} from '@angular/common';
import {UserModel} from '../models/UserModel';
import {AuthorizationService} from './Authorization.Service';
import {Router} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import * as signalR from '@aspnet/signalr';
import {StorageModel, StorageType} from '../models/StorageModel';
import {Convert, Network} from './CustomClass';
import {VisualService} from './visual.service';
import {ApiStorage} from './Api/ApiStorage';
import {MediaService} from './MediaService';
import {ApiStoragePermission} from './Api/ApiStoragePermission';
import {ApiMessage} from './Api/ApiMessage';
import {ApiUser} from './Api/ApiUser';

export class ChatHub{
  private static location: Location;
  static chatList: Array<ChatModel> = new Array<ChatModel>();
  private static connection: any;
  // tslint:disable-next-line:variable-name
  private static connectionId: string;
  public static get ConnectionId(): string{
    this.UpdateConnectionId();
    return this.connectionId;
  }
  static User: UserModel = new UserModel();
  static authorizationService: AuthorizationService;
  private static SelectChat: ChatModel = new ChatModel();
  static get selectChat(): ChatModel{
    return this.SelectChat;
  }
  static set selectChat(val){
    if (val == null){
      $('#dialogList').css('display', 'block');
      $('app-message-region').css('display', 'none');
      this.SelectChat = new ChatModel();
      return;
    }
    this.SelectChat = val;
    if (new VisualService().IsMobile){
      $('#dialogList').css('display', 'none');
      $('app-message-region').css('display', 'grid');
    }
  }
  static onAddMessage: EventEmitter<void> = new EventEmitter<void>();
  static onAddContactList: EventEmitter<void> = new EventEmitter<void>();
  static onChangeUsersList: EventEmitter<void> = new EventEmitter<void>();
  static onConnected: EventEmitter<void> = new EventEmitter<void>();
  static onEditMessage: EventEmitter<void> = new EventEmitter<void>();
  static onSelectContact: EventEmitter<void> = new EventEmitter<void>();
  static onCreateStorage: EventEmitter<StorageModel> = new EventEmitter<StorageModel>();

  public static initialize(local: Location, router: Router, cookieService: CookieService): void{
    this.location = local;
    this.authorizationService = new AuthorizationService(router, cookieService);
  }

  public static initializeHub(): void{
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('https://api.chat.privatevoda.space:5100/hub/chat', {
        accessTokenFactory: () => {
          return ChatHub.authorizationService.token; },
      })
      .build();
    if (this.connection == null) {
      return;
    }
    this.connection.start()
      .catch(err => console.error('Error start chat hub: ', err))
      .then(() => {
        ChatHub.UpdateConnectionId();
      });
    this.connection.on('deleteStorage', (sId) => {
      // tslint:disable-next-line:triple-equals
      const chat = this.chatList.find(p => p.Storage.id == sId);
      const index = this.chatList.indexOf(chat, 0);
      if (index > -1) {
        this.chatList.splice(index, 1);
      }
      // tslint:disable-next-line:triple-equals
      if (this.selectChat.Storage.id == sId){
        this.selectChat = new ChatModel();
        $('#detailedInfoAboutStorage').hide();
      }
    });
    this.connection.on('editMessage', (sId, mId, newText) => {
      // tslint:disable-next-line:triple-equals
      if (this.selectChat.Storage.id == sId){
        // tslint:disable-next-line:triple-equals
        const message = this.selectChat.MessageList.find(m => m.id == mId);
        if (message !== null) {
          message.textContent = newText;
        }
      }
      // tslint:disable-next-line:triple-equals
      const chat = this.chatList.find(p => p.Storage.id == sId);
      if (chat !== null) {
        // tslint:disable-next-line:triple-equals
        const message = chat.MessageList.find(m => m.id == mId);
        if (message !== null) {
          message.textContent = newText;
        }
      }
    });
    this.connection.on('receiveConnectionId', (id) => this.connectionId = id);
    this.connection.on('receiveStorage', (obj) => {
      const chat = new ChatModel();
      chat.Storage = obj;
      if (chat.Storage.imgContent == null){
        chat.Storage.imgContent = chat.Storage.type === StorageType.Private ? 'assets/imgs/default-user-avatar-96.png' :
                                                                              'assets/imgs/default-storage-icon.png';
      }else {
        chat.Storage.imgContent = MediaService.ConstructImageUrl(chat.Storage.imgContent);
      }

      chat.youPermissionsTemplateList = ApiStoragePermission.http(`me/list?sID=${chat.Storage.id}`, 'GET');
      chat.MessageList = ApiMessage.list(chat.Storage.id);
      this.chatList.push(chat);
    });
    this.connection.on('receiveMessage', (obj) => {
      const chat = this.chatList.find(o => o.Storage.id === obj.storage.id);
      let newMessage = new MessageModel();
      newMessage = obj.message;
      newMessage.sender = obj.sender;
      if (this.selectChat.Storage.id === obj.storage.id){
        this.selectChat.MessageList.push(newMessage);
      }else {
        let img = '';
        if (newMessage.sender.imgContent == null){
          img = (chat.Storage.type !== StorageType.Private ?
            'assets/imgs/default-storage-icon.png' :
            'assets/imgs/default-user-avatar-96.png');
        }else {
          img = MediaService.ConstructImageUrl(newMessage.sender.imgContent);
        }
        const title = chat.Storage.type === StorageType.Private ?
              chat.Storage.name :
              `[${chat.Storage.name}]: ${newMessage.sender.nickname}`;
        this.CreateNotification(title, newMessage.textContent, img);
        chat.MessageList.push(newMessage);
      }
    });
    this.connection.on('receiveStorageMainSettings', (obj) => {
      const editStorage = this.chatList.find(o => o.Storage.id === obj.id);
      editStorage.Storage.isPrivate = obj.isPrivate;
      editStorage.Storage.name = obj.name;
      editStorage.Storage.uniqueName = obj.uniqueName;
      if (this.selectChat.Storage.id === obj.id){
        this.selectChat.Storage.isPrivate = obj.isPrivate;
        this.selectChat.Storage.name = obj.name;
        this.selectChat.Storage.uniqueName = obj.uniqueName;
      }
    });
    this.connection.on('UpdateUserStatus', (obj) => {
      this.chatList.forEach(item => {
        const user = item.UsersList.find(p => p.id === obj.uID);
        if (Object.keys(user).length > 0){
          item.UsersList.find(p => p.id === obj.uID).status = obj.status ? 'Online' : obj.lastOnline;
        }
      });
    });
    this.connection.on('deleteMessage', (mId, chatId) => {
      let message;
      let index;
      // tslint:disable-next-line:triple-equals
      if (this.selectChat.Storage.id == chatId){
        // tslint:disable-next-line:triple-equals
        message = this.selectChat.MessageList.find(p => p.id == mId);
        index = this.selectChat.MessageList.indexOf(message, 0);
        if (index > -1) {
          this.selectChat.MessageList.splice(index, 1);
        }
      }
      // tslint:disable-next-line:triple-equals
      const chat = this.chatList.find(p => p.Storage.id == chatId);
      // tslint:disable-next-line:triple-equals
      message = chat.MessageList.find(p => p.id == mId);
      index = chat.MessageList.indexOf(message, 0);
      if (index > -1) {
        chat.MessageList.splice(index, 1);
      }
    });
    const chatList = ApiStorage.http('list', 'GET');
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < chatList.length; i++){
      const chat = new ChatModel();
      console.log(chatList[i].storage);
      chat.Storage = chatList[i].storage;
      if (chat.Storage.imgContent == null){
        if (chat.Storage.type === 2) {
          Convert.toDataURL('assets/imgs/default-user-avatar-96.png', (res) => {
            chat.Storage.imgContent = res;
          });
        } else if (chat.Storage.type !== 2) {
          Convert.toDataURL('assets/imgs/default-storage-icon.png', (res) => {
            chat.Storage.imgContent = res;
          });
        }
      }else {
        chat.Storage.imgContent = MediaService.ConstructImageUrl(chat.Storage.imgContent);
      }
      chat.youPermissionsTemplateList = ApiStoragePermission.http(`me/list?sID=${chat.Storage.id}`, 'GET');
      chat.MessageList = chatList[i].message;
      this.chatList.push(chat);
    }
  }
  static Connected(): void{
    this.connection.start().catch(err => console.error('Error start chat hub: ', err));
  }

  static LeaveMessenger(): void{
    this.connection.send('LeaveMessenger');
  }

  static GetUserInfo(id: string): any{
    return ApiUser.http(id, 'GET');
  }

  public static UpdateConnectionId(): void{
    this.connection.send('GetConnectionId');
  }

  static Disconnected(): void {
    this.connection.stop().cache(err => console.error('Error stop chat hub: ', err));
  }

  static sendMessage(text: string, file: any): void {

    ApiMessage.send(
      this.selectChat.Storage.id,
      text,
      this.selectChat.Storage.type === StorageType.Private && this.selectChat.MessageList.length === 0,
      file);

    console.log(text);
    /*
    let q = '';
    if (this.selectChat.Storage.type === StorageType.Private && this.selectChat.MessageList.length === 0) {
      q = `api/message/post/private?uID=${this.selectChat.Storage.id}&textContent=` + text;
    }
    else {
      q = `api/message/post?sID=${this.selectChat.Storage.id}&textContent=` + text;
    }
    if (file != null) {
      Network.UploadFile(q, file, 'file');
    } else {
      this.authorizationService.http(q, 'POST', true);
    }
     */
  }

  static CreateNotification(title: string, content: string, image: string): void{
    if (!('Notification' in window)) {
      return;
    }
    else if (Notification.permission === 'granted') {
      this.viewNotification(title, content, image);
    }
    else if (Notification.permission !== 'denied') {
      Notification.requestPermission((permission) => {
        if (permission === 'granted') {
          this.viewNotification(title, content, image);
        }
      });
    }
  }

  private static viewNotification(title: string, content: string, image: string): void{
    const notification  = new Notification(title, {
      body: content,
      icon: image
    });
    notification.addEventListener('click', () => {
      alert('Click');
    });
  }
}
