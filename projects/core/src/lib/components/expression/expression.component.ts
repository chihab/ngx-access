import { Component, OnInit, Output, EventEmitter, TemplateRef, Input } from '@angular/core';

@Component({
  selector: 'ngx-expression',
  templateUrl: './expression.component.html',
  styleUrls: ['./expression.component.scss']
})
export class ExpressionComponent {
  @Input() expression;
  @Input() visible: boolean = true;
  @Output() onExpression: EventEmitter<string> = new EventEmitter<string>();
}
