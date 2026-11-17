import {TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateModule} from '@ngx-translate/core';
import {ImpactsDialogComponent} from '../dialogs/impacts-dialog/impacts-dialog.component';
import {WidgetService} from '../services/api/widget.service';
import {WidgetInfoViewModel} from '../models/WidgetInfoViewModel';

for (const sBrand of ['rise', 'emergency']) {
  describe(`${sBrand} impact evaluation styling`, () => {
    it('keeps telemetry borders and all land-use gauges visible in the selected theme', async () => {
      const sOriginalBrand = document.documentElement.getAttribute('data-brand');
      document.documentElement.setAttribute('data-brand', sBrand);
      try {
        spyOn(ImpactsDialogComponent.prototype, 'ngOnInit');
        await TestBed.configureTestingModule({
          imports: [ImpactsDialogComponent, NoopAnimationsModule, TranslateModule.forRoot()],
          providers: [{provide: WidgetService, useValue: {}}],
        }).compileComponents();
        const oFixture = TestBed.createComponent(ImpactsDialogComponent);
        oFixture.componentInstance.m_bImpactsAvailable = false;
        oFixture.componentInstance.m_oSelectedWidget = new WidgetInfoViewModel();
        oFixture.componentInstance.m_fCropsPerc = 0;
        oFixture.componentInstance.m_fGrassPerc = 0.25;
        oFixture.componentInstance.m_fBuiltPerc = 0.5;
        oFixture.detectChanges();

        const aoCards = oFixture.nativeElement.querySelectorAll('.impact-count-card-outline');
        expect(aoCards.length).toBe(3);
        for (const oCard of aoCards) {
          expect(getComputedStyle(oCard).borderTopColor).toBe(sBrand === 'emergency'
            ? 'rgb(214, 211, 209)' : 'rgba(242, 201, 76, 0.42)');
        }
        const aoTracks = oFixture.nativeElement.querySelectorAll('.arc-track');
        expect(aoTracks.length).toBe(3);
        for (const oTrack of aoTracks) {
          expect(getComputedStyle(oTrack).stroke).toBe(sBrand === 'emergency'
            ? 'rgb(168, 162, 158)' : 'rgba(255, 255, 255, 0.1)');
          expect(getComputedStyle(oTrack.nextElementSibling!).stroke).toBe(sBrand === 'emergency'
            ? 'rgb(185, 28, 28)' : 'rgb(239, 186, 53)');
        }
        oFixture.destroy();
      } finally {
        if (sOriginalBrand === null) {
          document.documentElement.removeAttribute('data-brand');
        } else {
          document.documentElement.setAttribute('data-brand', sOriginalBrand);
        }
      }
    });
  });
}
