import {CommonModule} from '@angular/common';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {provideRouter} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {RiseTextInputComponent} from '../components/rise-text-input/rise-text-input.component';
import {AreaService} from '../services/api/area.service';
import {AttachmentService} from '../services/api/attachment.service';
import {EventService} from '../services/api/event.service';
import {ConstantsService} from '../services/constants.service';
import {MapService} from '../services/map.service';
import {NotificationsDialogsService} from '../services/notifications-dialogs.service';
import {EventsComponent} from '../views/events/events.component';

for (const sBrand of ['rise', 'emergency']) {
  describe(`${sBrand} event attachments`, () => {
    it('keeps event names, attachment labels and upload hints readable without changing interactions', async () => {
      const sPreviousBrand = document.documentElement.getAttribute('data-brand');
      document.documentElement.setAttribute('data-brand', sBrand);
      spyOn(EventsComponent.prototype, 'ngOnInit');
      await TestBed.configureTestingModule({
        imports: [EventsComponent, TranslateModule.forRoot(), NoopAnimationsModule],
        providers: [
          provideRouter([]),
          ...[AreaService, AttachmentService, ConstantsService, EventService, MatDialog,
            MapService, NotificationsDialogsService].map(provide => ({provide, useValue: {}})),
        ],
      }).overrideComponent(EventsComponent, {
        set: {
          imports: [CommonModule, FormsModule, MatSlideToggleModule, RiseTextInputComponent, TranslateModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      }).compileComponents();
      const oFixture = TestBed.createComponent(EventsComponent);
      const oHost = document.createElement('rise-events');
      const oStyles = document.createElement('style');
      // Bootstrap's utility classes are not included in the branding test runner.
      oStyles.textContent = '.text-light { color: #f8f9fa !important; } .text-muted { color: rgba(33, 37, 41, .75) !important; }';
      document.body.append(oStyles, oHost);
      oHost.appendChild(oFixture.nativeElement);
      try {
        const oEvents = oFixture.componentInstance;
        const oFile = {name: 'flood-image.png', type: 'image'};
        oEvents.m_bUpdatingEvent = true;
        oEvents.m_oEvent = {name: 'Flood event'};
        oEvents.m_aoAllFiles = [oFile];
        oEvents.m_asOriginalAllFiles = [oFile];
        oEvents.m_oUploadImageFile = new File(['image'], 'new.png');
        oEvents.m_oUploadDocFile = new File(['doc'], 'new.pdf');
        oFixture.detectChanges();
        await oFixture.whenStable();

        const sLightColor = sBrand === 'emergency' ? 'rgb(41, 37, 36)' : 'rgb(248, 249, 250)';
        const sMutedColor = sBrand === 'emergency' ? 'rgb(87, 83, 78)' : 'rgba(33, 37, 41, 0.75)';
        const oSection = oHost.querySelector('.event-edit-attachments')!;
        const oTitle = oSection.querySelector('.text-uppercase.text-light')!;
        const oName = oSection.querySelector('.file-list-item .text-light')!;
        expect(oName.textContent?.trim()).toBe('flood-image.png');
        expect(getComputedStyle(oTitle).color).toBe(sLightColor);
        expect(getComputedStyle(oName).color).toBe(sLightColor);
        const aoSort = oSection.querySelectorAll<HTMLElement>('[title^="Click to toggle"]');
        aoSort.forEach(oSort => oSort.style.transition = 'none');
        expect(getComputedStyle(aoSort[0]).color).toBe(sLightColor);
        expect(getComputedStyle(aoSort[1]).color).toBe(sMutedColor);
        aoSort[1].click();
        oFixture.detectChanges();
        expect(getComputedStyle(aoSort[0]).color).toBe(sMutedColor);
        expect(getComputedStyle(aoSort[1]).color).toBe(sLightColor);

        const oInput = oHost.querySelector<HTMLInputElement>('rise-text-input input')!;
        expect(oInput.value).toBe('Flood event');
        expect(getComputedStyle(oInput).color).toBe(sBrand === 'emergency'
          ? 'rgb(41, 37, 36)' : 'rgba(255, 255, 255, 0.9)');
        const oPreview = spyOn(oEvents, 'previewFile');
        (oSection.querySelector('.file-list-item') as HTMLElement).click();
        expect(oPreview).toHaveBeenCalledOnceWith(oFile);

        const oUploads = oHost.querySelector('.event-edit-upload-zones')!;
        expect(oUploads.querySelectorAll('.text-light').length).toBe(2);
        for (const oHint of Array.from(oUploads.querySelectorAll('.text-light'))) {
          expect(getComputedStyle(oHint).color).toBe(sLightColor);
        }
        oEvents.m_oSelectedLocation = {lat: 49.6, lng: 6.1};
        oFixture.detectChanges();
        for (const oHint of Array.from(oUploads.querySelectorAll('.text-light'))) {
          expect(getComputedStyle(oHint).color).toBe(sLightColor);
        }
      } finally {
        oFixture.destroy();
        oHost.remove();
        oStyles.remove();
        if (sPreviousBrand === null) {
          document.documentElement.removeAttribute('data-brand');
        } else {
          document.documentElement.setAttribute('data-brand', sPreviousBrand);
        }
      }
    });
  });
}
