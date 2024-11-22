import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseChipMenuComponent } from './rise-chip-menu.component';

describe('RiseChipMenuComponent', () => {
  let component: RiseChipMenuComponent;
  let fixture: ComponentFixture<RiseChipMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseChipMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseChipMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
