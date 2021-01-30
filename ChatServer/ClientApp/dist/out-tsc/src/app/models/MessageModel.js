import { UserModel } from './UserModel';
export var MessageType;
(function (MessageType) {
    MessageType[MessageType["File"] = 0] = "File";
    MessageType[MessageType["Text"] = 1] = "Text";
    MessageType[MessageType["Post"] = 2] = "Post";
})(MessageType || (MessageType = {}));
export class MessageModel {
    constructor() {
        this.sender = new UserModel();
    }
}
export class MessageCreateViewModel {
    static getHtmlContent(message) {
        if (message.type === 0) {
            return `<a href="/api/file/${message.fileUrl}">
                  <img src="assets/imgs/download-button-100.png">
              </a>
              <span>${message.textContent}</span>`;
        }
        else if (message.type === 2) {
            return `<span>${message.textContent}</span>
              <img class="messageItem_content_img" src="${message.imgContent}">`;
        }
        else {
            return `<span>${message.textContent}</span>`;
        }
    }
}
//# sourceMappingURL=MessageModel.js.map