import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-are-you-sure',
  templateUrl: 'are.you.sure.component.html'
})
export class AreYouSureComponent{
  @Output() onChanged = new EventEmitter<boolean>();
  @Input() Question: string;

  Ok(): void{
    this.onChanged.emit(true);
  }
  Close(): void{
    this.onChanged.emit(false);
  }
}
