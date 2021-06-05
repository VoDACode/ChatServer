import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {StorageModel} from '../../models/StorageModel';
import {ChatHub} from '../../services/app.service.signalR';
import {ApiAuth} from '../../services/Api/ApiAuth';
import {MediaService} from '../../services/MediaService';
import {ApiStorageJoin} from '../../services/Api/ApiStorageJoin';

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
      const result = ApiStorageJoin.StorageInfo(this.Key);
      if (result.errorText){
        this.route.navigate(['/']);
      }
      this.storage = result;
      this.storage.imgContent = (this.storage.imgContent == null ?
            '/assets/imgs/default-storage-icon.png' : MediaService.ConstructImageUrl(this.Key));
    });
  }
  actionJoin(): void{
    if (!ApiAuth.isAuth){
      this.route.navigate(['/']);
      return;
    }
    ApiStorageJoin.JoinToOnKey(this.Key);
    this.route.navigate(['/']);
  }
}
