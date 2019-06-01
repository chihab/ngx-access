import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ngx-expression',
  templateUrl: './access-expression-editor.html',
  styleUrls: ['./access-expression-editor.scss']
})
export class AccessExpressionEditor {
  @Input() expression;
  @Input() canAccess;
  @Output() onExpression: EventEmitter<string> = new EventEmitter<string>();
}
