import { __decorate } from "tslib";
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRootComponent } from './app.root.component';
import { AppMessageRegionComponent } from './app.message.region.component';
import { RouterModule } from '@angular/router';
import { UrlParameters } from './CustomClass';
import { ChatHub } from './services/app.service.signalR';
import { AppMenuComponent } from './app.menu.component';
import { DetailInfoAboutStorageComponent } from './menu/detail.Info.About.Storage';
import { StorageSttingsComponent } from './menu/storage.sttings.component';
import { CreateStorageMenuComponent } from './menu/create.storage.menu.component';
import { SwitchComponent } from './switch.component';
import { LogRegInComponent } from './log.reg.in.component';
import { ChatComponent } from './chat.component';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { ConfirmEmailComponent } from './confirm.email.component';
import { SetPasswordComponent } from './set.password.component';
const appRoutes = [
    { path: '*', redirectTo: '/', pathMatch: 'full' },
    { path: 'login', component: LogRegInComponent },
    { path: 'chat', component: ChatComponent }
];
let AppModule = class AppModule {
    constructor(l, router, cookieService) {
        UrlParameters.initialize(l);
        ChatHub.initialize(l, router, cookieService);
        if (!ChatHub.authorizationService.IsValidToken) {
            console.log('Authorization error');
            cookieService.delete('auth_token');
        }
        else {
            console.log('Authorization done');
            ChatHub.authorizationService.UpdateUserInfo();
            ChatHub.initializeHub();
        }
    }
};
AppModule = __decorate([
    NgModule({
        declarations: [
            AppRootComponent, ChatComponent, AppMessageRegionComponent, AppMenuComponent, StorageSttingsComponent, SetPasswordComponent,
            DetailInfoAboutStorageComponent, CreateStorageMenuComponent, SwitchComponent, LogRegInComponent, ConfirmEmailComponent
        ],
        imports: [
            BrowserModule, FormsModule, HttpClientModule, RouterModule, RouterModule.forRoot(appRoutes)
        ],
        providers: [CookieService],
        bootstrap: [AppRootComponent]
    })
], AppModule);
export { AppModule };
window.onbeforeunload = (e) => {
    ChatHub.LeaveMessenger();
};
//# sourceMappingURL=app.module.js.map