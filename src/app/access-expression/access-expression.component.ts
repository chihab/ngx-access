import { Component, ViewChild } from '@angular/core';
import { AccessExpressionEditor } from 'ngx-access';
import { MatSidenav } from '@angular/material';

@Component({
  selector: 'app-access-expression',
  templateUrl: './access-expression.component.html',
  styleUrls: ['./access-expression.component.css']
})
export class AccessExpressionPanel extends AccessExpressionEditor {
  @ViewChild('sidenav') sidenav: MatSidenav;

  close() {
    this.sidenav.close();
  }
}
