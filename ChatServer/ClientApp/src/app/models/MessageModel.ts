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
  fileName: string;
}
