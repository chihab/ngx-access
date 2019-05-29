import { Component, OnInit } from '@angular/core';
import { AccessService } from 'ngx-access';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  accesses;
  debug$;

  constructor(private accessService: AccessService) { }

  ngOnInit() {
    this.accesses = this.accessService.getConfiguration();
    this.debug$ = this.accessService.debug();
  }

  debug(debug: boolean) {
    this.accessService.setDebug(debug);
  }

}
