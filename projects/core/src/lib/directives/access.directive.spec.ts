import { Observable, of } from 'rxjs';
import { Component } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AccessModule } from '../core.module';
import { AccessStrategy } from '../services/access-strategy.service';

@Component({
  selector: 'ngx-access-cmp',
  template: ``,
})
class TestComponent {}

@Component({
  selector: 'ngx-access-sub-cmp',
  template: ``,
})
class SubComponent {}

export class MyAccessStrategy implements AccessStrategy {
  has(access: string): Observable<boolean> {
    return of(true);
  }
}

describe('Access Directive', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AccessModule.forRoot({
          access: {
            Resource: {
              Child1: {
                Create: 'CanAccess',
              },
              Child2: {
                Create: 'CanAccess',
              },
            },
          },
          redirectTo: '/forbidden',
        }),
      ],
      providers: [
        {
          provide: AccessStrategy,
          useClass: MyAccessStrategy,
        },
      ],
      declarations: [TestComponent, SubComponent],
    });
  });

  it('should display element when directive  not been applied', () => {
    TestBed.overrideTemplate(TestComponent, `<div></div>`);
    const fixture: ComponentFixture<TestComponent> = TestBed.createComponent(
      TestComponent
    );
    fixture.detectChanges();
    const de = fixture.debugElement.query(By.css('div'));
    expect(de).not.toBeNull();
  });

  it('should not create element when access not configured', () => {
    TestBed.overrideTemplate(
      TestComponent,
      `<div *ngxAccess="':Something.Read'"></div>`
    );
    const fixture: ComponentFixture<TestComponent> = TestBed.createComponent(
      TestComponent
    );
    fixture.detectChanges();
    const de = fixture.debugElement.query(By.css('div'));
    expect(de).toBeNull();
  });

  it('should create element when access configured and allowed', () => {
    TestBed.overrideTemplate(
      TestComponent,
      `<div *ngxAccess="':Resource.Create'"></div>`
    );
    const fixture: ComponentFixture<TestComponent> = TestBed.createComponent(
      TestComponent
    );
    fixture.detectChanges();
    const de = fixture.debugElement.query(By.css('div'));
    expect(de).not.toBeNull();
  });

  it('should create component from else template when access not given', () => {
    TestBed.overrideTemplate(
      TestComponent,
      `
        <ng-template #noAccess><span>No Access</span></ng-template>
        <div *ngxAccess="':Resource.Read' else noAccess"></div>
    `
    );
    const fixture: ComponentFixture<TestComponent> = TestBed.createComponent(
      TestComponent
    );
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('div'))).toBeNull();
    expect(fixture.debugElement.query(By.css('span'))).not.toBeNull();
  });

  xit('should deduce path from parent component directive', () => {
    TestBed.overrideTemplate(
      TestComponent,
      `
      <h2> Parent Component </h2>
      <div id=':.parent" ngxAccess="Resource.Create'>
        <div id="child1" *ngxAccess="'.Child1'"> Child 1 </div>
        <div id="child2" *ngxAccess="'.Child2'"> Child 2 </div>
        <div id="child3" *ngxAccess="'.Child3'"> Child 3 </div>
      </div>
    `
    );
    const fixture: ComponentFixture<TestComponent> = TestBed.createComponent(
      TestComponent
    );
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('div#parent'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('div#child1'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('div#child2'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('div#child3'))).toBeFalsy();
  });
});
