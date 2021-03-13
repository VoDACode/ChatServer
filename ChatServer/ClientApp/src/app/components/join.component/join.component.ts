import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {StorageModel} from '../../models/StorageModel';
import {ChatHub} from '../../services/app.service.signalR';

@Component({
  selector: 'app-join-component',
  templateUrl: 'join.component.html'
})
export class JoinComponent{
  Key: string;
  storage: StorageModel = new StorageModel();
  constructor(private activatedRoute: ActivatedRoute, private route: Router) {
    activatedRoute.params.subscribe((params) => {
      this.Key = params.key;
      const result = ChatHub.authorizationService.http(`api/storage/join/info/${this.Key}`, 'GET');
      if (result.errorText){
        this.route.navigate(['/']);
      }
      this.storage = result;
      this.storage.imgContent = (this.storage.imgContent == null ?
            '/assets/imgs/default-storage-icon.png' : '/api/image?key=' + this.Key);
    });
  }
  actionJoin(): void{
    if (!ChatHub.authorizationService.logIn){
      this.route.navigate(['/']);
      return;
    }
    ChatHub.authorizationService.http(`api/storage/join/${this.Key}`, 'GET');
    this.route.navigate(['/']);
  }
}
