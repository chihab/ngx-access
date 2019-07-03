import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessExpressionEditor } from './access-expression-editor.component';

describe('AccessExpressionEditor', () => {
  let component: AccessExpressionEditor;
  let fixture: ComponentFixture<AccessExpressionEditor>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessExpressionEditor ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessExpressionEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});