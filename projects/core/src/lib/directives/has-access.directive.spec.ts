import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HasAccessDirective } from './has-access.directive';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { canExpression, setConfigurationAccess, setHasAccessStrategy } from '../helpers';

@Component({
  selector: 'ngx-has-access-test',
  template: ``
})
class TestComponent {
}

describe('HasAccess Directive', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HasAccessDirective, TestComponent]
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

    TestBed.overrideTemplate(TestComponent, `<div *appHasAccess="'Something'"></div>`);
    const fixture: ComponentFixture<TestComponent> = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const de = fixture.debugElement.query(By.css('div'));
    expect(de).toBeNull();
  });

  it('should not create element when access disallowed', () => {
    TestBed.overrideTemplate(TestComponent, `<div *appHasAccess="'Something'"></div>`);
    const fixture: ComponentFixture<TestComponent> = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const de = fixture.debugElement.query(By.css('div'));
    expect(de).toBeNull();
  });

  it('should create element when access configured and allowed', () => {
    TestBed.overrideTemplate(TestComponent, `<div *appHasAccess="'Resource:create'"></div>`);
    setConfigurationAccess({
      Resource: {
        create: ['SomeRandomAccess']
      }
    });
    const hasAccessStrategy = jasmine.createSpy();
    setHasAccessStrategy(hasAccessStrategy);
    hasAccessStrategy.and.returnValue(true);
    const fixture: ComponentFixture<TestComponent> = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(hasAccessStrategy).toHaveBeenCalledWith('SomeRandomAccess');
    const de = fixture.debugElement.query(By.css('div'));
    expect(de).not.toBeNull();
  });

  it('should not create element when access configured but not allowed', () => {
    TestBed.overrideTemplate(TestComponent, `<div *appHasAccess="'Resource:create'"></div>`);
    setConfigurationAccess({
      Resource: {
        create: ['SomeRandomAccess']
      }
    });
    const hasAccessStrategy = jasmine.createSpy();
    setHasAccessStrategy(hasAccessStrategy);
    hasAccessStrategy.and.returnValue(false);
    const fixture: ComponentFixture<TestComponent> = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const de = fixture.debugElement.query(By.css('div'));
    expect(de).toBeNull();
  });

  it('should create component from else template when access not given', () => {
    TestBed.overrideTemplate(TestComponent, `
        <ng-template #noAccess><span>No Access</span></ng-template>
        <div *appHasAccess="'Resource:create', else: noAccess"></div>
    `);
    const fixture: ComponentFixture<TestComponent> = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('div'))).toBeNull();
    expect(fixture.debugElement.query(By.css('span'))).not.toBeNull();
  });

});
