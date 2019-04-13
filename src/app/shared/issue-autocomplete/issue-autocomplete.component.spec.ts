import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueAutocompleteComponent } from './issue-autocomplete.component';

describe('IssueAutocompleteComponent', () => {
   let component: IssueAutocompleteComponent;
   let fixture: ComponentFixture<IssueAutocompleteComponent>;

   beforeEach(async(() => {
      TestBed.configureTestingModule({
         declarations: [IssueAutocompleteComponent]
      })
         .compileComponents();
   }));

   beforeEach(() => {
      fixture = TestBed.createComponent(IssueAutocompleteComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });
});
