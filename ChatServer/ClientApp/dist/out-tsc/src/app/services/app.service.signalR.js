import { EventEmitter } from '@angular/core';
import { ChatModel } from '../models/ChatModel';
import { MessageModel } from '../models/MessageModel';
import { UserModel } from '../models/UserModel';
import { AuthorizationService } from './Authorization.Service';
import * as signalR from '@aspnet/signalr';
import { Convert, Network } from '../CustomClass';
export class ChatHub {
    static get ConnectionId() {
        this.UpdateConnectionId();
        return this.connectionId;
    }
    static initialize(local, router, cookieService) {
        this.location = local;
        this.authorizationService = new AuthorizationService(router, cookieService);
    }
    static initializeHub() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl('hub/chat', {
            accessTokenFactory: () => {
                return ChatHub.authorizationService.token;
            },
        })
            .build();
        this.connection.start()
            .catch(err => console.error('Error start chat hub: ', err))
            .then(() => {
            ChatHub.UpdateConnectionId();
        });
        this.connection.on('receiveConnectionId', (id) => this.connectionId = id);
        this.connection.on('receiveStorage', (obj) => {
            const chat = new ChatModel();
            chat.Storage = obj;
            chat.PermissionsTemplateList = this.authorizationService.http(`api/storage/permission/list?sID=${chat.Storage.id}`, 'GET');
            chat.youPermissionsTemplateList = this.authorizationService.http(`api/storage/me/permission/list?sID=${chat.Storage.id}`, 'GET');
            this.chatList.push(chat);
        });
        this.connection.on('receiveMessage', (obj) => {
            const chat = this.chatList.find(o => o.Storage.id === obj.storage.id);
            let newMessage = new MessageModel();
            newMessage = obj.message;
            newMessage.sender = obj.sender;
            if (this.selectChat.Storage.id === obj.storage.id) {
                this.selectChat.MessageList.push(newMessage);
            }
            else {
                chat.MessageList.push(newMessage);
            }
            $('#MessagesBox').animate({ scrollTop: $('#MessagesBox').height() }, 200);
        });
        this.connection.on('receiveStorageMainSettings', (obj) => {
            const editStorage = this.chatList.find(o => o.Storage.id === obj.id);
            editStorage.Storage.isPrivate = obj.isPrivate;
            editStorage.Storage.name = obj.name;
            editStorage.Storage.uniqueName = obj.uniqueName;
            if (this.selectChat.Storage.id === obj.id) {
                this.selectChat.Storage.isPrivate = obj.isPrivate;
                this.selectChat.Storage.name = obj.name;
                this.selectChat.Storage.uniqueName = obj.uniqueName;
            }
        });
        const chatList = this.authorizationService.http('api/storage/list', 'GET');
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < chatList.length; i++) {
            const chat = new ChatModel();
            chat.Storage = chatList[i].storage;
            if (chat.Storage.imgContent === null) {
                if (chat.Storage.type === 2) {
                    Convert.toDataURL('assets/imgs/default-user-avatar-96.png', (res) => {
                        chat.Storage.imgContent = res;
                    });
                }
                else if (chat.Storage.type !== 2) {
                    Convert.toDataURL('assets/imgs/default-storage-icon.png', (res) => {
                        chat.Storage.imgContent = res;
                    });
                }
            }
            chat.youPermissionsTemplateList = this.authorizationService.http(`api/storage/permission/me/list?sID=${chat.Storage.id}`, 'GET');
            chat.MessageList = chatList[i].message;
            this.chatList.push(chat);
        }
        console.log(this.chatList);
    }
    static Connected() {
        this.connection.start().catch(err => console.error('Error start chat hub: ', err));
    }
    static GetUserInfo(id) {
        return this.authorizationService.http(`api/user/${id}`, 'GET');
    }
    static UpdateConnectionId() {
        this.connection.send('GetConnectionId');
    }
    static Disconnected() {
        this.connection.stop().cache(err => console.error('Error stop chat hub: ', err));
    }
    static sendMessage(text, file) {
        const q = `api/message/post?sID=${this.selectChat.Storage.id}&textContent=${text}`;
        if (file != null) {
            Network.UploadFile(q, file, 'file');
        }
        else {
            this.authorizationService.http(q, 'POST', true);
        }
    }
}
ChatHub.chatList = new Array();
ChatHub.IsSetPassword = false;
ChatHub.User = new UserModel();
ChatHub.selectChat = new ChatModel();
ChatHub.onAddMessage = new EventEmitter();
ChatHub.onAddContactList = new EventEmitter();
ChatHub.onChangeUsersList = new EventEmitter();
ChatHub.onConnected = new EventEmitter();
ChatHub.onEditMessage = new EventEmitter();
ChatHub.onSelectContact = new EventEmitter();
ChatHub.onCreateStorage = new EventEmitter();
//# sourceMappingURL=app.service.signalR.js.map