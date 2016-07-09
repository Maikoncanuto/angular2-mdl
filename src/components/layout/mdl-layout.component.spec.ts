import {
  describe,
  expect,
  it,
  inject,
  beforeEach
} from '@angular/core/testing';
import { By, DOCUMENT } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { TestComponentBuilder } from '@angular/compiler/testing';
import {
  MdlLayoutComponent,
  MDL_LAYOUT_DIRECTIVES,
  MdlLayoutHeaderComponent
} from './index';
import {MdlLayoutContentComponent} from "./mdl-layout-content.component";

describe('Component: MdlLayout', () => {

  var builder: TestComponentBuilder;
  var doc: HTMLDocument;

  beforeEach(inject([TestComponentBuilder, DOCUMENT], function (tcb: TestComponentBuilder, document) {
    builder = tcb;
    doc = document;
  }));

  it('should add the css class mdl-layout__container to the child of the host element', ( done ) => {

    return builder
      .overrideTemplate(MdlTestLayoutComponent, `
          <mdl-layout>x</mdl-layout>
        `)
      .createAsync(MdlTestLayoutComponent).then( (fixture) => {

        fixture.detectChanges();

        let layoutEl: HTMLElement = fixture.debugElement.query(By.directive(MdlLayoutComponent)).nativeElement;
        let layoutContainer: HTMLElement = <HTMLElement>layoutEl.children.item(0);
        expect(layoutContainer.classList.contains('mdl-layout__container')).toBe(true);

        let layoutMainElement = <HTMLElement>layoutContainer.children.item(0);
        expect(layoutMainElement.classList.contains('mdl-layout')).toBe(true);
        done();
      });
  });

  it('should configure layout mode standard if no mode is provided', (done) => {
    return builder
      .overrideTemplate(MdlTestLayoutComponent, `
          <mdl-layout mdl-layout-mode="">x</mdl-layout>
        `)
      .createAsync(MdlTestLayoutComponent).then( (fixture) => {

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.directive(MdlLayoutComponent)).componentInstance.mode).toBe('standard');

        done();
      });
  });

  it('should throw if an unsupported layout type is provided', (done) => {
    return builder
      .overrideTemplate(MdlTestLayoutComponent, `
          <mdl-layout mdl-layout-mode="test">x</mdl-layout>
        `)
      .createAsync(MdlTestLayoutComponent).then( (fixture) => {

        expect( () => {
          fixture.detectChanges();
        }).toThrow();

        done();
      });
  });
  
  it('should close the obfuscator if the escape key is pressed', (done) => {
    return builder
      .overrideTemplate(MdlTestLayoutComponent, `
          <mdl-layout>
            <mdl-layout-header></mdl-layout-header>
            <mdl-layout-drawer></mdl-layout-drawer>
            <mdl-layout-content></mdl-layout-content>
          </mdl-layout>
        `)
      .createAsync(MdlTestLayoutComponent).then( (fixture) => {
        
        fixture.detectChanges();
        let layoutComponent = fixture.debugElement.query(By.directive(MdlLayoutComponent)).componentInstance;
        layoutComponent.isDrawerVisible = true;

        let obfuscatorElement =  fixture.debugElement.query(By.css('.mdl-layout__obfuscator')).nativeElement;

        // dirty hack to provide an event with keyCode
        var e = <any>new Event('keydown');
        e.keyCode = 27;
        obfuscatorElement.dispatchEvent(e);

        expect(layoutComponent.isDrawerVisible).toBe(false);
        
        done();
      });
  });

  it('should unregister the scroll listener if a content is present', ( done ) => {

    return builder
      .overrideTemplate(MdlTestLayoutComponent, `
          <mdl-layout>
            <mdl-layout-header></mdl-layout-header>
            <mdl-layout-drawer></mdl-layout-drawer>
            <mdl-layout-content></mdl-layout-content>
          </mdl-layout>
        `)
      .createAsync(MdlTestLayoutComponent).then( (fixture) => {

        fixture.detectChanges();
        let layoutComponent = fixture.debugElement.query(By.directive(MdlLayoutComponent)).componentInstance;

        expect(layoutComponent.scrollListener).toBeDefined();

        layoutComponent.ngOnDestroy();

        expect(layoutComponent.scrollListener).toBeNull();

        done();
      });

  });

  it('should safely unregister the scroll listener if no content is present', ( done ) => {

    return builder
      .overrideTemplate(MdlTestLayoutComponent, `
          <mdl-layout>
            <mdl-layout-header></mdl-layout-header>
            <mdl-layout-drawer></mdl-layout-drawer>
          </mdl-layout>
        `)
      .createAsync(MdlTestLayoutComponent).then( (fixture) => {

        fixture.detectChanges();
        let layoutComponent = fixture.debugElement.query(By.directive(MdlLayoutComponent)).componentInstance;

        expect(layoutComponent.scrollListener).toBeUndefined();

        layoutComponent.ngOnDestroy();

        expect(layoutComponent.scrollListener).toBeUndefined();

        done();
      });

  });

  it('should change the small screen css on small screens', ( done ) => {
    return builder
      .overrideTemplate(MdlTestLayoutComponent, `
          <mdl-layout>
            <mdl-layout-header></mdl-layout-header>
            <mdl-layout-drawer></mdl-layout-drawer>
            <mdl-layout-content></mdl-layout-content>
          </mdl-layout>
        `)
      .createAsync(MdlTestLayoutComponent).then( (fixture) => {

        fixture.detectChanges();
        let layoutComponent = fixture.debugElement.query(By.directive(MdlLayoutComponent)).componentInstance;

        // small screen
        layoutComponent.onQueryChange(true);
        fixture.detectChanges();
        let mdlLayoutElement =  fixture.debugElement.query(By.css('.mdl-layout')).nativeElement;
        expect(mdlLayoutElement.classList.contains('is-small-screen')).toBe(true);

        // large screen
        layoutComponent.onQueryChange(false);
        fixture.detectChanges();
        expect(mdlLayoutElement.classList.contains('is-small-screen')).toBe(false);


        done();
      });
  });

  it('should call onscroll if the content is getting ascroll event', ( done ) => {
    return builder
      .overrideTemplate(MdlTestLayoutComponent, `
          <mdl-layout>
            <mdl-layout-content></mdl-layout-content>
          </mdl-layout>
        `)
      .createAsync(MdlTestLayoutComponent).then( (fixture) => {

        fixture.detectChanges();
        let layoutDebugElement = fixture.debugElement.query(By.directive(MdlLayoutComponent));
        let layoutComponent = layoutDebugElement.componentInstance;

        let contentEl = fixture.debugElement.query(By.directive(MdlLayoutContentComponent)).nativeElement;

        spyOn(layoutComponent, 'onScroll');

        var scrollEvent = new CustomEvent('scroll');
        contentEl.dispatchEvent(scrollEvent);

        expect(layoutComponent.onScroll).toHaveBeenCalled();

        done();
      });
  });
});


@Component({
  selector: 'test-layout',
  template: 'replaced by the test',
  directives: [MDL_LAYOUT_DIRECTIVES, MdlLayoutHeaderComponent]
})
class MdlTestLayoutComponent {}