import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmInvitedUserRegistrationComponent } from './confirm-invited-user-registration.component';

describe('ConfirmRegistrationComponent', () => {
  let component: ConfirmInvitedUserRegistrationComponent;
  let fixture: ComponentFixture<ConfirmInvitedUserRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmInvitedUserRegistrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmInvitedUserRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
