import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseNumberInputComponent } from './rise-number-input.component';

describe('RiseNumberInputComponent', () => {
  let component: RiseNumberInputComponent;
  let fixture: ComponentFixture<RiseNumberInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseNumberInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseNumberInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
