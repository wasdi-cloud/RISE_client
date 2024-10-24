import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseTextareaInputComponent } from './rise-textarea-input.component';

describe('RiseTextAreaInputComponent', () => {
  let component: RiseTextareaInputComponent;
  let fixture: ComponentFixture<RiseTextareaInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseTextareaInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiseTextareaInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
