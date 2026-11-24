import {TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import {TranslateModule} from '@ngx-translate/core';
import {of} from 'rxjs';
import {MapService} from '../services/map.service';
import {ConstantsService} from '../services/constants.service';
import {NotificationsDialogsService} from '../services/notifications-dialogs.service';
import {AuthService} from '../services/api/auth.service';
import {OrganizationsService} from '../services/api/organizations.service';
import {UserService} from '../services/api/user.service';
import {UserViewModel} from '../models/UserViewModel';
import {UserAccountComponent} from '../views/account/user-account/user-account.component';
import {BRAND_CONFIG, EMERGENCY_BRAND, RISE_BRAND} from './brand.config';

for (const oBrand of [RISE_BRAND, EMERGENCY_BRAND]) {
  describe(`${oBrand.id} default basemap`, () => {
    let oUser: UserViewModel;
    let oService: MapService;

    beforeEach(async () => {
      oUser = Object.assign(new UserViewModel(), {userId: 'new-user', email: 'user@example.test'});
      await TestBed.configureTestingModule({
        imports: [UserAccountComponent, TranslateModule.forRoot()],
        providers: [
          {provide: BRAND_CONFIG, useValue: oBrand},
          {provide: ConstantsService, useValue: {getUser: () => oUser}},
          {provide: UserService, useValue: {getUser: () => of({...oUser})}},
          {provide: OrganizationsService, useValue: {getByUser: () => of(null)}},
          ...[HttpClient, MatDialog, NotificationsDialogsService, AuthService]
            .map(provide => ({provide, useValue: {}})),
        ],
      }).overrideComponent(UserAccountComponent, {set: {template: '', imports: []}}).compileComponents();
      oService = TestBed.inject(MapService);
      oService.initTilelayer();
    });

    for (const sPreference of [undefined, '', 'Dark', 'Standard', 'Topology', 'Street', 'World Imagery']) {
      it(`uses the correct map and account selection for preference "${sPreference}"`, () => {
        oUser.defaultBaseMap = sPreference;
        const sExpected = sPreference || (oBrand.id === 'emergency' ? 'Standard' : 'Dark');
        const aoLayers = {
          Dark: oService.m_oDarkGrayArcGIS,
          Standard: oService.m_oOSMBasic,
          Topology: oService.m_oOpenTopoMap,
          Street: oService.m_oEsriWorldStreetMap,
          'World Imagery': oService.m_oEsriWorldImagery,
        };
        oService.setMapOptions();
        const oExpectedLayer = aoLayers[sExpected];
        expect(oService.m_oActiveBaseLayer).toBe(oExpectedLayer);
        expect(oService.m_oOptions.layers).toEqual([oExpectedLayer]);

        const oFixture = TestBed.createComponent(UserAccountComponent);
        try {
          oFixture.componentInstance.getUserInfo();
          expect(oFixture.componentInstance.m_oUser.defaultBaseMap).toBe(sExpected);
          expect(oFixture.componentInstance.hasMapChanged()).toBeFalse();
          expect(oUser.defaultBaseMap).toBe(sPreference);
        } finally {
          oFixture.destroy();
        }
      });
    }

    it('uses the brand default before user information is available', () => {
      TestBed.inject(ConstantsService).getUser = () => null;
      oService.setMapOptions();
      expect(oService.m_oActiveBaseLayer).toBe(oBrand.id === 'emergency'
        ? oService.m_oOSMBasic : oService.m_oDarkGrayArcGIS);
    });
  });
}
