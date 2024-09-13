import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseTextInputComponent } from './rise-text-input.component';

describe('RiseTextInputComponent', () => {
  let component: RiseTextInputComponent;
  let fixture: ComponentFixture<RiseTextInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseTextInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseTextInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
