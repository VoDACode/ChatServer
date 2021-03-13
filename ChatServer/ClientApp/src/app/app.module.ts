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
import {FileDownloadComponent} from './components/file.download.component/file-download.component';
import {UserInformationComponent} from './components/user.information.component/user.information.component';
import {UserListComponent} from './components/detail.Info.About.Storage/user.list.component/user.list.component';
import {DetailStorageSettingsComponent} from './components/detail.Info.About.Storage/settings.component/settings.component';
import {BanSettingsComponent} from './components/storage.settings/ban.settings.component/ban.settings.component';
import {JoinLinkSettingsComponent} from './components/storage.settings/join.link.settings.component/join.link.settings.component';
import {LogSettingsComponent} from './components/storage.settings/log.settings.component/log.settings.component';
import {MainSettingsComponent} from './components/storage.settings/main.settings.component/main.settings.component';
import {PermissionSettingsComponent} from './components/storage.settings/permission.settings.component/permission.settings.component';
import {LogInComponent} from './components/log.reg.in.component/log.in.component/log-in.component';
import {RegInComponent} from './components/log.reg.in.component/reg.in.component/reg.in.component';
import {LogRegTopPanel} from './components/log.reg.in.component/log.reg.top.panel/log.reg.top.panel';
import {JoinComponent} from './components/join.component/join.component';

const appRoutes: Routes = [
  {path: '*', redirectTo: '/', pathMatch: 'full'},
  {path: '', component: LogRegInComponent, children: [
      {path: 'login', component: LogInComponent},
      {path: 'regin', component: RegInComponent}
      ]},
  {path: 'chat', component: ChatComponent, children: [
      {path: 'storage', children: [
            {path: 'info/:id', component: DetailInfoAboutStorageComponent, children: [
              {path: 'userlist/:id', component: UserListComponent},
              {path: 'settings', component: DetailStorageSettingsComponent}
          ]},
            {path: 'settings', component: StorageSttingsComponent, children: [
              {path: 'main', component: MainSettingsComponent},
              {path: 'permission', component: PermissionSettingsComponent},
              {path: 'log', component: LogSettingsComponent},
              {path: 'ban', component: BanSettingsComponent},
              {path: 'join', component: JoinLinkSettingsComponent}
            ]},
        ]},
      {path: 'user/info/:id', component: UserInformationComponent},
    ]},
  {path: 'set_password', component: SetPasswordComponent},
  {path: 'confirmEmail', component: ConfirmEmailComponent},
  {path: 'join/:key', component: JoinComponent}
];

@NgModule({
  declarations: [
    AppRootComponent, ChatComponent, AppMessageRegionComponent, MenuComponents, StorageSttingsComponent, SetPasswordComponent
    , DetailInfoAboutStorageComponent, CreateStorageMenuComponent, SwitchComponent
    , LogRegInComponent, LogInComponent, RegInComponent, LogRegTopPanel,
    ConfirmEmailComponent, FileDownloadComponent, UserInformationComponent, UserListComponent, DetailStorageSettingsComponent,
    BanSettingsComponent, JoinLinkSettingsComponent, LogSettingsComponent, MainSettingsComponent, PermissionSettingsComponent,
    JoinComponent
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
