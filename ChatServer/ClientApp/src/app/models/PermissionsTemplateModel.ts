import {StorageModel} from './StorageModel';

export class PermissionsTemplateModel{
  id = 0;
  name = '';
  storage: StorageModel = new StorageModel();
  // Roles
  isDeleteRoles = false;
  isCreateRoles = false;
  isEditRoles = false;
  // Users
  isKickUser = false;
  isBanUser = false;
  isMuteUser = false;
  // Messages
  isSendMessage = false;
  isDeleteMessages = false;
  isSendFiles = false;
  //
  isGenerateJoinURL = false;
  isCopyJoinURL = false;
  isDeleteJoinURL = false;
  // storage
  isCanEditSettings = false;
  isCanViewSettings = false;
  isRenameStorage = false;
  isDeleteStorage = false;
  isEditTitleImage = false;
  isReadLog = false;
}
