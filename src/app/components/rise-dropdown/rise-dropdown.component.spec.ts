import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseDropdownComponent } from './rise-dropdown.component';

describe('RiseDropdownComponent', () => {
  let component: RiseDropdownComponent;
  let fixture: ComponentFixture<RiseDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseDropdownComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
