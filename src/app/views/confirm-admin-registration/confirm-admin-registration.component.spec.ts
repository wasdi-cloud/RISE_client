import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmAdminRegistrationComponent } from './confirm-admin-registration.component';

describe('ConfirmRegistrationComponent', () => {
  let component: ConfirmAdminRegistrationComponent;
  let fixture: ComponentFixture<ConfirmAdminRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmAdminRegistrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmAdminRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
