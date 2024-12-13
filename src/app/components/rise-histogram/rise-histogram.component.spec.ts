import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseHistogramComponent } from './rise-histogram.component';

describe('RiseHistogramComponent', () => {
  let component: RiseHistogramComponent;
  let fixture: ComponentFixture<RiseHistogramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseHistogramComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseHistogramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
