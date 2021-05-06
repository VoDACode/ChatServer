import {Component, OnDestroy, OnInit} from '@angular/core';

import * as Hammer from 'hammerjs';

@Component({
  selector: `app-root`,
  templateUrl: './root.component.html'
})
export class AppRootComponent{
  constructor() {
    /*
    const mc = new Hammer(document.documentElement);
    mc.on('panleft panright tap press', (ev) => {
      alert(ev.type);
    });
    */
  }
}
