import { Observable, of } from 'rxjs';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AccessModule } from '../../public-api';
import { AccessStrategy } from '../services';

@Component({
  selector: 'ngx-has-access-test',
  template: ``
})
class TestComponent {
}

export class MyAccessStrategy implements AccessStrategy {
  has(access: string): Observable<boolean> {
    return of('CanAccess' === access);
  }
}

describe('HasAccess Directive', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AccessModule.forRoot({
          accesses: {
            Resource: {
              create: 'CanAccess'
            }
          },
          redirect: '/forbidden',
          strategy: {provide: AccessStrategy, useClass: MyAccessStrategy}
        }),
      ],
      declarations: [TestComponent]
    });
  });

  it('should display element when directive has not been applied', () => {
    TestBed.overrideTemplate(TestComponent, `<div></div>`);
    const fixture: ComponentFixture<TestComponent> = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const de = fixture.debugElement.query(By.css('div'));
    expect(de).not.toBeNull();
  });

  it('should not create element when access not configured', () => {
    TestBed.overrideTemplate(TestComponent, `<div *ngxHasAccess="'Something'"></div>`);
    const fixture: ComponentFixture<TestComponent> = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const de = fixture.debugElement.query(By.css('div'));
    expect(de).toBeNull();
  });

  it('should create element when access configured and allowed', () => {
    TestBed.overrideTemplate(TestComponent, `<div *ngxHasAccess="'Resource.create'"></div>`);
    const fixture: ComponentFixture<TestComponent> = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const de = fixture.debugElement.query(By.css('div'));
    expect(de).not.toBeNull();
  });

  it('should create component from else template when access not given', () => {
    TestBed.overrideTemplate(TestComponent, `
        <ng-template #noAccess><span>No Access</span></ng-template>
        <div *ngxHasAccess="'Resource.read', else: noAccess"></div>
    `);
    const fixture: ComponentFixture<TestComponent> = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('div'))).toBeNull();
    expect(fixture.debugElement.query(By.css('span'))).not.toBeNull();
  });

});
