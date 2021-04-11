import { Component, OnInit } from '@angular/core';
import { AccessService, AccessStrategy } from 'ngx-access';

const conf1 = {
  access: {
    UserForm: {
      FirstName: {
        Read: 'CanReadFirstName',
      },
      Login: {
        Read: 'CanReadFirstLogin',
      },
    },
  },
  redirectTo: '/forbidden',
};
const conf2 = {
  access: {
    'UserForm.FirstName.Read': 'CanReadFirstName',
  },
  redirectTo: '/forbidden',
};

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
    this.accessService.setConfiguration(conf1.access);
    this.accessService.setAccessStrategy(this.accessStrategy);
  }
}
