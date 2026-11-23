import {TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import {TranslateModule} from '@ngx-translate/core';
import * as L from 'leaflet';
import {MapService} from '../services/map.service';
import {ConstantsService} from '../services/constants.service';
import {NotificationsDialogsService} from '../services/notifications-dialogs.service';
import {BRAND_CONFIG, EMERGENCY_BRAND, RISE_BRAND} from './brand.config';

for (const oBrand of [RISE_BRAND, EMERGENCY_BRAND]) {
  describe(`${oBrand.id} area markers`, () => {
    it('selects public, private, and shared icons while preserving tooltips and clicks', () => {
      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot()],
        providers: [
          {provide: BRAND_CONFIG, useValue: oBrand},
          {provide: ConstantsService, useValue: {getUser: () => ({organizationId: 'own'})}},
          {provide: HttpClient, useValue: {}},
          {provide: MatDialog, useValue: {}},
          {provide: NotificationsDialogsService, useValue: {}},
        ],
      });
      const oService = TestBed.inject(MapService);
      const oContainer = document.createElement('div');
      document.body.appendChild(oContainer);
      const oMap = L.map(oContainer).setView([49.6, 6.1], 6);
      const oClicked = jasmine.createSpy('marker clicked');
      const oSubscription = oService.m_oMarkerSubject$.subscribe(oClicked);
      try {
        for (const oCase of [
          {organizationId: 'own', publicArea: false, kind: 'private', legacy: 'icon-location-hazard-filled.png', prefix: ''},
          {organizationId: 'other', publicArea: false, kind: 'shared', legacy: 'icon-location-hazard-filled-shared.png', prefix: 'Shared - '},
          {organizationId: 'other', publicArea: true, kind: 'public', legacy: 'icon-location-hazard-filled-public.png', prefix: 'Public - '},
        ]) {
          const oArea = {
            ...oCase, name: 'Luxembourg',
            markerCoordinates: 'POINT (6.1 49.6)',
            bbox: 'POLYGON ((6 49, 7 49, 7 50, 6 50, 6 49))',
          };
          const oMarker = oService.addAreaMarker(oArea, oMap);
          expect(oMarker).toBeTruthy();
          expect(oMarker.options.icon!.options.iconUrl).toBe(oBrand.id === 'emergency'
            ? `assets/branding/marker-${oCase.kind}.svg` : `assets/rise-assets/${oCase.legacy}`);
          expect(oMarker.getTooltip()!.getContent()).toBe(oCase.prefix + 'Luxembourg');
          expect(oMarker.getLatLng()).toEqual(L.latLng(49.6, 6.1));
          if (oBrand.id === 'emergency') {
            expect(oMarker.options.icon!.options.iconSize).toEqual([22, 30]);
            expect(oMarker.options.icon!.options.iconAnchor).toEqual([11, 29]);
          }
          oMarker.fire('click');
          expect(oClicked).toHaveBeenCalledWith(oArea);
        }
      } finally {
        oSubscription.unsubscribe();
        oMap.remove();
        oContainer.remove();
      }
    });
  });
}
