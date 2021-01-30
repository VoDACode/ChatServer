import {MessageModel} from './MessageModel';
import {ModelBad, ModelJoinLink, ModelLog, ModelPermissionsTemplate} from '../menu/storage.sttings.component';
import {ContactModel} from './ContactModel';
import {PermissionsTemplateModel} from './PermissionsTemplateModel';
import {UserModel} from './UserModel';

export class ChatModel {
  MessageList: Array<MessageModel> = new Array<MessageModel>();
  UsersList: Array<UserModel> = new Array<UserModel>();
  Storage: ContactModel = new ContactModel();
  PermissionsTemplateList: Array<ModelPermissionsTemplate> = new Array<ModelPermissionsTemplate>();
  youPermissionsTemplateList: Array<PermissionsTemplateModel> = new Array<PermissionsTemplateModel>();
  JoinLinks: Array<ModelJoinLink> = new Array<ModelJoinLink>();
  BanList: Array<ModelBad> = new Array<ModelBad>();
  LogList: Array<ModelLog> = new Array<ModelLog>();
}
