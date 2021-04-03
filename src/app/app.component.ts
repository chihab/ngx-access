import { Component, OnInit } from '@angular/core';
import { AccessService, AccessStrategy } from 'ngx-access';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(
    private accessService: AccessService,
    private accessStrategy: AccessStrategy
  ) {}
  ngOnInit() {
    this.accessService.setConfiguration({
      UserForm: {
        FirstName: {
          Read: 'CanReadFirstName',
        },
        Login: {
          Read: 'CanReadLogin',
        },
      },
    });
    this.accessService.setAccessStrategy(this.accessStrategy);
  }
}
