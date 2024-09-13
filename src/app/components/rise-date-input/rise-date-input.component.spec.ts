import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseDateInputComponent } from './rise-date-input.component';

describe('RiseDateInputComponent', () => {
  let component: RiseDateInputComponent;
  let fixture: ComponentFixture<RiseDateInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseDateInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseDateInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
