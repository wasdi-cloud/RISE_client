import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseOngoingWidgetComponent } from './rise-ongoing-widget.component';

describe('RiseOngoingWidgetComponent', () => {
  let component: RiseOngoingWidgetComponent;
  let fixture: ComponentFixture<RiseOngoingWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseOngoingWidgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseOngoingWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
