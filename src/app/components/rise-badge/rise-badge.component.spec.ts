import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseBadgeComponent } from './rise-badge.component';

describe('RiseBadgeComponent', () => {
  let component: RiseBadgeComponent;
  let fixture: ComponentFixture<RiseBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseBadgeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
