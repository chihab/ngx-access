import { Observable, of } from 'rxjs';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AccessModule } from '../../public-api';
import { AccessStrategy } from '../services';

@Component({
  selector: 'ngx-has-access-cmp',
  template: ``
})
class TestComponent {
}

@Component({
  selector: 'ngx-has-access-sub-cmp',
  template: ``
})
class SubComponent {
}

export class MyAccessStrategy implements AccessStrategy {
  has(access: string): Observable<boolean> {
    return of(true);
  }
}

describe('HasAccess Directive', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AccessModule.forRoot({
          accesses: {
            Resource: {
              Child1: {
                create: 'CanAccess'
              },
              Child2: {
                create: 'CanAccess'
              }
            }
          },
          redirect: '/forbidden',
          strategy: {provide: AccessStrategy, useClass: MyAccessStrategy}
        }),
      ],
      declarations: [TestComponent, SubComponent]
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

  it('should deduce path from parent component directive', () => {
    TestBed.overrideTemplate(TestComponent, `
      <h2> Parent Component </h2>
      <div id="parent" ngxAccessPath="Resource:create">
        <ng-container *ngxHasAccess>
          <div id="child1" *ngxHasAccess="'$.Child1'"> Child 1 </div>
          <div id="child2" *ngxHasAccess="'$.Child2'"> Child 2 </div>
          <div id="child3" *ngxHasAccess="'$.Child3'"> Child 3 </div>
        </ng-container>
      </div>
    `);
    const fixture: ComponentFixture<TestComponent> = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('div#parent'))).toBeTruthy()
    expect(fixture.debugElement.query(By.css('div#child1'))).toBeTruthy()
    expect(fixture.debugElement.query(By.css('div#child2'))).toBeTruthy()
    expect(fixture.debugElement.query(By.css('div#child3'))).toBeFalsy()
  });

});
