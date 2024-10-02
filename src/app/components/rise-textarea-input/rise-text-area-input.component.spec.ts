import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseTextAreaInputComponent } from './rise-text-area-input.component';

describe('RiseTextAreaInputComponent', () => {
  let component: RiseTextAreaInputComponent;
  let fixture: ComponentFixture<RiseTextAreaInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseTextAreaInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiseTextAreaInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
