import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorklogListItemComponent } from './worklog-list-item.component';

describe('WorklogListItemComponent', () => {
  let component: WorklogListItemComponent;
  let fixture: ComponentFixture<WorklogListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorklogListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorklogListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
