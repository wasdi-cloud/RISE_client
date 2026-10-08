import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseAooWidgetComponent } from './rise-aoo-widget.component';

describe('RiseAooWidgetComponent', () => {
  let component: RiseAooWidgetComponent;
  let fixture: ComponentFixture<RiseAooWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseAooWidgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseAooWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
