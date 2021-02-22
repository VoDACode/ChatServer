import { BrowserModule } from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {AppRootComponent} from './app.root.component';
import {AppMessageRegionComponent} from './components/message.region/app.message.region.component';
import {Router, RouterModule, Routes} from '@angular/router';
import {Location} from '@angular/common';
import {UrlParameters} from './services/CustomClass';
import {ChatHub} from './services/app.service.signalR';
import {MenuComponents} from './components/menu.component/menu.components';
import {DetailInfoAboutStorageComponent} from './components/detail.Info.About.Storage/detail.Info.About.Storage';
import {StorageSttingsComponent} from './components/storage.settings/storage.sttings.component';
import {CreateStorageMenuComponent} from './components/create.storage.menu/create.storage.menu.component';
import {SwitchComponent} from './components/switch.component/switch.component';
import {LogRegInComponent} from './components/log.reg.in.component/log.reg.in.component';
import {ChatComponent} from './components/chat.component/chat.component';
import {HttpClientModule} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {ConfirmEmailComponent} from './components/confirm.email/confirm.email.component';
import {SetPasswordComponent} from './components/set.password.component/set.password.component';
import * as $ from 'jquery';

const appRoutes: Routes = [
  { path: '*', redirectTo: '/', pathMatch: 'full'},
  { path: 'login', component: LogRegInComponent},
  { path: 'chat', component: ChatComponent}
];

@NgModule({
  declarations: [
    AppRootComponent, ChatComponent, AppMessageRegionComponent, MenuComponents, StorageSttingsComponent, SetPasswordComponent
    , DetailInfoAboutStorageComponent, CreateStorageMenuComponent, SwitchComponent, LogRegInComponent, ConfirmEmailComponent
  ],
  imports: [
    BrowserModule, FormsModule, HttpClientModule, RouterModule, RouterModule.forRoot(appRoutes)
  ],
  providers: [CookieService],
  bootstrap: [AppRootComponent]
})

export class AppModule {
  constructor(l: Location, router: Router, cookieService: CookieService) {
    UrlParameters.initialize(l);
    ChatHub.initialize(l, router, cookieService);
    if (!ChatHub.authorizationService.IsValidToken) {
      console.log('Authorization error');
      cookieService.delete('auth_token');
    }else {
      console.log('Authorization done');
      ChatHub.authorizationService.UpdateUserInfo();
      ChatHub.initializeHub();
    }
  }
}

window.onbeforeunload = (e) => {
  ChatHub.LeaveMessenger();
};
$(document).bind( 'click', () => {
  $('#MessageMenu').hide();
});
