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
    this.accesses = this.accessService.getAccessConfiguration();
    this.debug$ = this.accessService.debug();
  }

  debug(debug: boolean) {
    this.accessService.setDebug(debug);
  }

  copy() {
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.style.visibility = 'none';
    selBox.value = JSON.stringify(this.accesses);
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }
}
