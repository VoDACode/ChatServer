import { __decorate } from "tslib";
import { Component, EventEmitter, Input, Output } from '@angular/core';
let SwitchComponent = class SwitchComponent {
    constructor() {
        this.onChanged = new EventEmitter();
        this.Lable = '';
        this.IsRound = true;
        this.valueName = '';
    }
    Changed() {
        const tmp = new SwitchType();
        tmp.parameter = (this.valueName.length === 0) ? this.Lable : this.valueName;
        tmp.val = this.Status;
        this.onChanged.emit(tmp);
    }
};
__decorate([
    Output()
], SwitchComponent.prototype, "onChanged", void 0);
__decorate([
    Input()
], SwitchComponent.prototype, "Lable", void 0);
__decorate([
    Input()
], SwitchComponent.prototype, "IsRound", void 0);
__decorate([
    Input()
], SwitchComponent.prototype, "Status", void 0);
__decorate([
    Input()
], SwitchComponent.prototype, "valueName", void 0);
SwitchComponent = __decorate([
    Component({
        templateUrl: 'source/html/switch.component.html',
        selector: 'app-switch'
    })
], SwitchComponent);
export { SwitchComponent };
export class SwitchType {
}
//# sourceMappingURL=switch.component.js.map