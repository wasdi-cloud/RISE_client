import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseCalendarComponent } from './rise-calendar.component';

describe('RiseCalendarComponent', () => {
  let component: RiseCalendarComponent;
  let fixture: ComponentFixture<RiseCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseCalendarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
