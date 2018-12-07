import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '../../shared/app-material.module';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderComponent ],
      imports: [
        RouterTestingModule,
        AppMaterialModule
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain the app name', () => {
    const appAnchor: HTMLAnchorElement = fixture.debugElement.nativeElement.querySelector('.brand');
    expect(appAnchor.text).toContain('Kaal');
  });

  describe('Navigation', () => {

    let anchors: HTMLAnchorElement[];
    let hrefs: string[];

    beforeEach(() => {
      anchors = Array.from(fixture.debugElement.nativeElement.querySelectorAll('a'));
      hrefs = anchors.map((anchor) => anchor.getAttribute('href'));
    });

    it('should provide a way to access worklogs', () => {
      expect(hrefs).toEqual(jasmine.arrayContaining(['/worklogs']));
    });

    it('should provide a way to access settings', () => {
      expect(hrefs).toEqual(jasmine.arrayContaining(['/settings']));
    });

  });
});
