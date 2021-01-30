import {UserModel} from './UserModel';

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
}
export class MessageCreateViewModel{
  static getHtmlContent(message: MessageModel): string{
    if (message.type === 0){
      return `<a href="/api/file/${message.fileUrl}">
                  <img src="assets/imgs/download-button-100.png">
              </a>
              <span>${message.textContent}</span>`;
    }
    else if (message.type === 2){
      return `<span>${message.textContent}</span>
              <img class="messageItem_content_img" src="${message.imgContent}">`;
    }
    else {
      return `<span>${message.textContent}</span>`;
    }
  }
}
