import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  templateUrl: 'source/html/switch.component.html',
  selector: 'app-switch'
})

export class SwitchComponent {
  @Output() onChanged = new EventEmitter<SwitchType>();
  @Input() Lable = '';
  @Input() IsRound = true;
  @Input() Status: boolean;
  @Input() valueName = '';
  Changed(): void{
    const tmp = new SwitchType();
    tmp.parameter = (this.valueName.length === 0) ? this.Lable : this.valueName;
    tmp.val = this.Status;
    this.onChanged.emit(tmp);
  }
}
export class SwitchType{
  parameter: string;
  val: any;
}
