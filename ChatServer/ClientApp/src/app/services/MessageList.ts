import {MessageModel} from '../models/MessageModel';

export class MessageList {
  private list: Array<MessageModel> = new Array<MessageModel>();
  public getList(): Array<MessageModel>{
    return this.list;
  }
  public add(obj: MessageModel): void{
    this.list.push(obj);
  }
}
