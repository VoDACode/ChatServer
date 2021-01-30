import {Component, HostListener} from '@angular/core';
import {AuthorizationService} from './services/Authorization.Service';
import {ChatHub} from './services/app.service.signalR';

@Component({
  selector: `app-root`,
  templateUrl: './source/html/root.component.html'
})
export class AppRootComponent {
  IsDEBUG = false;
  getAuthorization(): AuthorizationService{
    return ChatHub.authorizationService;
  }
  IsSetPassword(): ChatHub{
    return ChatHub.IsSetPassword;
  }
}
