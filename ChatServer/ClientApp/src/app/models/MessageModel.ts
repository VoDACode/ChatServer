import {UserModel} from './UserModel';
import {StorageModel} from './StorageModel';

export enum MessageType {
  File, Text, Post
}
export class MessageModel{
  sender: UserModel = new UserModel();
  sendDate: string;
  type: MessageType;
  id: string;
  textContent: string;
  imgContent: string;
  fileUrl: string;
  fileName: string;
}
export class MessageCreateViewModel{
  static getHtmlContent(message: MessageModel, storage: StorageModel): string{
    // tslint:disable-next-line:triple-equals
    if (message.type == 0){
      return '';
    }
    // tslint:disable-next-line:triple-equals
    else if (message.type == 2){
      return `<span>${message.textContent}</span>
              <img class="messageItem_content_img" src="${message.imgContent}">`;
    }
    else {
      return `<span>${message.textContent}</span>`;
    }
  }
}
