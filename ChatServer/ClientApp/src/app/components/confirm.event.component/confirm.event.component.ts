import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiConfirm} from '../../services/Api/ApiConfirm';
import {delay} from 'rxjs/operators';
import {emit} from 'cluster';

@Component({
  selector: 'app-confirm-event-component',
  templateUrl: 'confirm.event.component.html'
})
export class ConfirmEventComponent implements OnInit{

  errors: Array<string> = new Array<string>();
  private email: string;
  private key: string;
  constructor(private routeAction: ActivatedRoute, private route: Router) {
    routeAction.params.subscribe(params => {
      this.key = params.key;
    });
    routeAction.queryParams.subscribe(query => {
      this.email = query.email;
    });
  }

  ngOnInit(): void {
    const result = ApiConfirm.confirm(this.key, this.email);
    console.log(result);
    if (result.isError == true){
      this.errors.push(result.text);
      delay(1000);
      this.route.navigate(['/']);
      return;
    }
    if (result.eventName == 'PasswordRecovery'){
      this.route.navigate([`/forgot`, result.key], {queryParams: {email: result.email}});
      return;
    }
    this.route.navigate(['/']);
  }
}
