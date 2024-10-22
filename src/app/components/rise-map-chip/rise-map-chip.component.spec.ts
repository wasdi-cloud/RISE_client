import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseMapChipComponent } from './rise-map-chip.component';

describe('RiseMapChipComponent', () => {
  let component: RiseMapChipComponent;
  let fixture: ComponentFixture<RiseMapChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseMapChipComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseMapChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
