import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessExpressionComponent } from './access-expression.component';

describe('AccessExpressionComponent', () => {
  let component: AccessExpressionComponent;
  let fixture: ComponentFixture<AccessExpressionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessExpressionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessExpressionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
