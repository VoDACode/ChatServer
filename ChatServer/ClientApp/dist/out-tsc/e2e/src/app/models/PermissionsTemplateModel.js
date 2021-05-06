import { StorageModel } from './StorageModel';
export class PermissionsTemplateModel {
    constructor() {
        this.id = 0;
        this.name = '';
        this.storage = new StorageModel();
        // Roles
        this.isDeleteRoles = false;
        this.isCreateRoles = false;
        this.isEditRoles = false;
        // Users
        this.isKickUser = false;
        this.isBanUser = false;
        this.isMuteUser = false;
        // Messages
        this.isSendMessage = false;
        this.isDeleteMessages = false;
        this.isSendFiles = false;
        //
        this.isGenerateJoinURL = false;
        this.isCopyJoinURL = false;
        this.isDeleteJoinURL = false;
        // storage
        this.isCanEditSettings = false;
        this.isCanViewSettings = false;
        this.isRenameStorage = false;
        this.isDeleteStorage = false;
        this.isEditTitleImage = false;
        this.isReadLog = false;
    }
}
//# sourceMappingURL=PermissionsTemplateModel.js.map