import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeForgetPasswordComponent } from './change-forget-password.component';

describe('ChangeForgetPasswordComponent', () => {
  let component: ChangeForgetPasswordComponent;
  let fixture: ComponentFixture<ChangeForgetPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeForgetPasswordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChangeForgetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
