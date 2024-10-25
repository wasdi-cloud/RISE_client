import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseCheckboxComponent } from './rise-checkbox.component';

describe('RiseCheckBoxComponent', () => {
  let component: RiseCheckboxComponent;
  let fixture: ComponentFixture<RiseCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseCheckboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RiseCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
