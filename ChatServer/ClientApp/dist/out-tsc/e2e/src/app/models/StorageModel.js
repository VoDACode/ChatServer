export var StorageType;
(function (StorageType) {
    StorageType[StorageType["Channel"] = 0] = "Channel";
    StorageType[StorageType["Group"] = 1] = "Group";
    StorageType[StorageType["Private"] = 2] = "Private";
})(StorageType || (StorageType = {}));
export class StorageModel {
    constructor() {
        this.imgContent = '';
        this.name = '';
        this.status = '';
        this.uniqueName = '';
    }
}
//# sourceMappingURL=StorageModel.js.map