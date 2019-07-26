import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkdaySummaryComponent } from './workday-summary.component';

describe('WorkdaySummaryComponent', () => {
   let component: WorkdaySummaryComponent;
   let fixture: ComponentFixture<WorkdaySummaryComponent>;

   beforeEach(async(() => {
      TestBed.configureTestingModule({
         declarations: [WorkdaySummaryComponent]
      }).compileComponents();
   }));

   beforeEach(() => {
      fixture = TestBed.createComponent(WorkdaySummaryComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });
});
