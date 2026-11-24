import {TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {provideRouter} from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {of, Subject} from 'rxjs';
import {RiseCollaboratorsComponent} from '../components/rise-collaborators/rise-collaborators.component';
import {UserRole} from '../models/UserRole';
import {OrganizationViewModel} from '../models/OrganizationViewModel';
import {AreaService} from '../services/api/area.service';
import {AuthService} from '../services/api/auth.service';
import {OrganizationsService} from '../services/api/organizations.service';
import {UserService} from '../services/api/user.service';
import {ConstantsService} from '../services/constants.service';
import {NotificationsDialogsService} from '../services/notifications-dialogs.service';
import {UserOrganizationComponent} from '../views/account/user-organization/user-organization.component';
import {provideHttpClient} from '@angular/common/http';

for (const sBrand of ['rise', 'emergency']) {
  describe(`${sBrand} organization invitations`, () => {
    it('shows pending and expired invites without member actions, then enables actions after confirmation', async () => {
      const sPreviousBrand = document.documentElement.getAttribute('data-brand');
      document.documentElement.setAttribute('data-brand', sBrand);
      try {
        await TestBed.configureTestingModule({
          imports: [RiseCollaboratorsComponent, TranslateModule.forRoot(), NoopAnimationsModule],
          providers: [
            {provide: AreaService, useValue: {}},
            {provide: NotificationsDialogsService, useValue: {}},
          ],
        }).compileComponents();
        const oTranslate = TestBed.inject(TranslateService);
        oTranslate.setTranslation('en', {COLLABORATORS: {
          INVITATION_PENDING: 'Pending invitation', INVITATION_EXPIRED: 'Invitation expired',
        }});
        oTranslate.use('en');
        const oFixture = TestBed.createComponent(RiseCollaboratorsComponent);
        const oHost: HTMLElement = oFixture.nativeElement;
        document.body.appendChild(oHost);
        try {
          oFixture.componentRef.setInput('m_sResourceType', 'organization');
          oFixture.componentRef.setInput('m_aoUsers', [
            {email: 'pending@example.test', role: UserRole.HQ, invitationStatus: 'PENDING'},
            {email: 'expired@example.test', role: UserRole.HQ, invitationStatus: 'EXPIRED'},
            {email: 'member@example.test', role: UserRole.HQ, userId: 'member'},
          ]);
          oFixture.detectChanges();
          const aoRows = oHost.querySelectorAll<HTMLTableRowElement>('tbody tr');
          expect(aoRows[0].textContent).toContain('pending@example.test');
          expect(aoRows[0].textContent).toContain('Pending invitation');
          expect(aoRows[0].querySelector('td')?.textContent?.trim()).toBe('—');
          expect(aoRows[0].querySelector('.option')).toBeNull();
          expect(aoRows[1].textContent).toContain('Invitation expired');
          expect(aoRows[1].querySelector('.option')).toBeNull();
          expect(aoRows[2].querySelectorAll('.option').length).toBe(2);
          const oStatus = aoRows[0].querySelector('.invitation-status')!;
          expect(getComputedStyle(oStatus).color).toBe(sBrand === 'emergency'
            ? 'rgb(41, 37, 36)' : 'rgba(255, 255, 255, 0.9)');
          oFixture.componentRef.setInput('m_aoUsers', [
            {email: 'pending@example.test', role: UserRole.HQ, userId: 'confirmed'},
          ]);
          oFixture.detectChanges();
          expect(oHost.querySelector('.invitation-status')).toBeNull();
          expect(oHost.querySelectorAll('tbody tr:first-child .option').length).toBe(2);
        } finally {
          oFixture.destroy();
          oHost.remove();
        }

      } finally {
        if (sPreviousBrand === null) {
          document.documentElement.removeAttribute('data-brand');
        } else {
          document.documentElement.setAttribute('data-brand', sPreviousBrand);
        }
      }
    });
  });
}

describe('Organization invitation refresh', () => {
  it('reloads organization members when the invite dialog closes', async () => {
    const oClosed = new Subject<void>();
    const oUsers = [{email: 'invitee@example.test', invitationStatus: 'PENDING' as const}];
    const oOrganizationService = {getOrganizationUsers: jasmine.createSpy().and.returnValue(of(oUsers))};
    await TestBed.configureTestingModule({
      imports: [UserOrganizationComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]), provideHttpClient(),
        {provide: MatDialog, useValue: {open: () => ({afterClosed: () => oClosed.asObservable()})}},
        {provide: OrganizationsService, useValue: oOrganizationService},
        ...[AuthService, ConstantsService, NotificationsDialogsService, UserService]
          .map(provide => ({provide, useValue: {}})),
      ],
    }).overrideComponent(UserOrganizationComponent, {set: {template: '', imports: []}}).compileComponents();
    const oFixture = TestBed.createComponent(UserOrganizationComponent);
    oFixture.componentInstance.m_oOrganization = Object.assign(new OrganizationViewModel(), {id: 'organization'});
    oFixture.componentInstance.openInviteUser(true);
    expect(oOrganizationService.getOrganizationUsers).not.toHaveBeenCalled();
    oClosed.next();
    expect(oOrganizationService.getOrganizationUsers).toHaveBeenCalledTimes(1);
    expect(oFixture.componentInstance.m_aoOrgUsers).toEqual(oUsers);
    oFixture.destroy();
  });
});
