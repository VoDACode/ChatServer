import {Component} from '@angular/core';
import {ChatHub} from '../../services/app.service.signalR';
import {ChatModel} from '../../models/ChatModel';
import * as $ from 'jquery';
import {StorageType} from '../../models/StorageModel';
import {Router} from '@angular/router';
import {VisualService} from '../../services/visual.service';
import {MediaService} from '../../services/MediaService';
import {ApiStorage} from '../../services/Api/ApiStorage';
import {ApiAuth} from '../../services/Api/ApiAuth';

@Component({
  templateUrl: './chat.component.html',
  selector: 'app-chat'
})
export class ChatComponent{
  SearchQuery = '';
  ViewContactItem = this.getChatList();

  SelectContextChat: ChatModel = new ChatModel();
  IsViewAreYouSure = false;

  constructor(private router: Router) {
    if (!ApiAuth.isAuth){
      this.router.navigate(['']);
    }
  }

  get MyName(): string{
    return ChatHub.User.nickname;
  }

  get IsMySavedMessages(): boolean{
    const result = ApiStorage.getType(ChatHub.selectChat.Storage.id);
    return result.type === 'SAVED_MESSAGES';
  }

  get MyInterlocutorId(): string{
    const result = ApiStorage.getType(ChatHub.selectChat.Storage.id);
    return result.userId;
  }

  get IsDeleteChat(): boolean{
    return this.SelectContextChat.youPermissionsTemplateList.find(p => p.isDeleteStorage) != null
            || this.SelectContextChat.Storage.type === StorageType.Private;
  }
  get IsPrivateChat(): boolean{
    return this.SelectContextChat.Storage.type === StorageType.Private;
  }
  get IsDeleteMessages(): boolean{
    return this.SelectContextChat.youPermissionsTemplateList.find(p => p.isDeleteMessages) != null;
  }

  getSelectChat(): ChatModel{
    return ChatHub.selectChat;
  }
  getChatList(): Array<ChatModel>{
    return ChatHub.chatList;
  }
  openLeftTabMenu(): void{
    document.getElementById('LeftTabMenu').style.display = 'block';
    $('#LeftTabMenu').animate({
      left: '0'
    }, 500);
    $('app-message-region').bind( 'click', () => {
      $('#LeftTabMenu').animate({
        left: `-${new VisualService().IsMobile ? '75' : '25'}%`
      }, 500);
    });
    $('#LeftTabMenu>.bg').bind( 'click', () => {
      $('#LeftTabMenu').animate({
        left: `-${new VisualService().IsMobile ? '75' : '25'}%`
      }, 500);
    });
  }
  onChangeSearch(): void{
    if (this.SearchQuery.length !== 0) {
      const res = ApiStorage.search(this.SearchQuery);
      this.ViewContactItem = new Array<ChatModel>();
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < res.length; i++) {
        const tmp = new ChatModel();
        tmp.Storage.id = res[i].id;
        tmp.Storage.type = res[i].type;
        tmp.Storage.name = res[i].name;
        tmp.Storage.uniqueName = res[i].uniqueName;
        tmp.Storage.imgContent = res[i].imgContent;
        if (tmp.Storage.imgContent == null) {
          if (tmp.Storage.type === 1) {
            tmp.Storage.imgContent = 'assets/imgs/default-user-avatar-96.png';
          } else if (tmp.Storage.type === 0) {
            tmp.Storage.imgContent = 'assets/imgs/default-storage-icon.png';
          }
        }else{
          tmp.Storage.imgContent = MediaService.ConstructImageUrl(res[i].imgContent);
        }
        tmp.Storage.status = res[i].status;
        tmp.Storage.isPrivate = res[i].viewType;
        this.ViewContactItem.push(tmp);
      }
    }else {
      this.ViewContactItem = this.getChatList();
    }
  }
  onOpenCreateMenu(): void{
    $('#createStorageMenu').show();
  }

  onSelectContact(selectChat: ChatModel): void{
    if (this.SearchQuery.length !== 0) {
      if (selectChat.Storage.type === 0) {
        ApiStorage.JoinTo(selectChat.Storage.id, '1');
      }else if (selectChat.Storage.type === 1) {
        ChatHub.selectChat = new ChatModel();
        ChatHub.selectChat.Storage.id = selectChat.Storage.id;
        ChatHub.selectChat.Storage.name = selectChat.Storage.name;
        ChatHub.selectChat.Storage.imgContent = selectChat.Storage.imgContent;
        ChatHub.selectChat.Storage.type = StorageType.Private;
        return;
      }
    }
    // tslint:disable-next-line:triple-equals
    const chat = ChatHub.chatList.find(o => o.Storage.id == selectChat.Storage.id);
    if (chat !== undefined) {
      ChatHub.selectChat = chat;
    }
  }

  eventAreYouSure(val: boolean): void{
    if (val){
      ApiStorage.delete(this.SelectContextChat.Storage.id);
    }
    this.IsViewAreYouSure = false;
  }

  openContextMenu(chat: ChatModel, e): boolean{
    this.SelectContextChat = chat;
    $('#ChatMenu').attr('target-storage', chat.Storage.id);
    $('#ChatMenu').css({top: e.pageY, left: e.pageX, position: 'absolute'});
    $('#ChatMenu').show();
    return false;
  }
}
