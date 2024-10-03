import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseAlertsWidgetComponent } from './rise-alerts-widget.component';

describe('RiseAlertsWidgetComponent', () => {
  let component: RiseAlertsWidgetComponent;
  let fixture: ComponentFixture<RiseAlertsWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseAlertsWidgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseAlertsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
