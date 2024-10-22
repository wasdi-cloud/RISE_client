import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseBannerComponent } from './rise-banner.component';

describe('RiseBannerComponent', () => {
  let component: RiseBannerComponent;
  let fixture: ComponentFixture<RiseBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseBannerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
