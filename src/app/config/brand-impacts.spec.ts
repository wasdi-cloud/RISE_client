import {TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ImpactsDialogComponent} from '../dialogs/impacts-dialog/impacts-dialog.component';
import {WidgetService} from '../services/api/widget.service';
import {WidgetInfoViewModel} from '../models/WidgetInfoViewModel';

describe('impact evaluation number formatting', () => {
  it('groups telemetry, land-use areas, and both feature totals without changing zero or missing counts', async () => {
    spyOn(ImpactsDialogComponent.prototype, 'ngOnInit');
    await TestBed.configureTestingModule({
      imports: [ImpactsDialogComponent, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [{provide: WidgetService, useValue: {}}],
    }).compileComponents();
    const oFixture = TestBed.createComponent(ImpactsDialogComponent);
    const oDialog = oFixture.componentInstance;
    const oRoot: HTMLElement = oFixture.nativeElement;
    oDialog.m_bImpactsAvailable = false;
    const oWidget = new WidgetInfoViewModel();
    oWidget.payload = {populationCount: 1234567, exposuresCount: 0, roadsCount: 2345};
    oDialog.m_oSelectedWidget = oWidget;
    oDialog.m_sCropsTotArea = oDialog.formatSquareMetersToKm(1234560000);
    oDialog.m_aoImpactRows = Array.from({length: 1200}, (_, iIndex) => ({
      name: `Feature ${iIndex}`, type: iIndex < 1100 ? 'Roads' : 'Buildings', raw: {},
    }));
    oDialog.m_aoImpactSummary = [{type: 'Roads', count: 1100}];
    oFixture.detectChanges();

    const readCounts = () => Array.from(oRoot.querySelectorAll('.impact-count-card strong'),
      oCount => oCount.textContent?.trim());
    expect(readCounts()).toEqual(['1,234,567', '0', '2,345']);
    expect(oRoot.querySelector('.impact-landuse-grid')?.textContent).toContain('1,234.56 km²');
    delete oWidget.payload['exposuresCount'];
    oFixture.detectChanges();
    expect(readCounts()[1]).toBe('N.A.');

    const oFeaturesTab = oRoot.querySelectorAll<HTMLButtonElement>('.impact-dialog-tab')[1];
    oFeaturesTab.click();
    oDialog.selectImpactType('Roads');
    oFixture.detectChanges();
    expect(oFeaturesTab.textContent?.trim()).toBe('Affected Features (1,200)');
    expect(oRoot.querySelector('.drawer-features-header strong')?.textContent?.trim())
      .toBe('Affected Features (1,100)');
    expect(oRoot.querySelector('.impact-summary-item strong')?.textContent?.trim()).toBe('1,100');
  });

  it('shows a pointer and a named navigation tooltip over clickable feature cells', async () => {
    spyOn(ImpactsDialogComponent.prototype, 'ngOnInit');
    await TestBed.configureTestingModule({
      imports: [ImpactsDialogComponent, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [{provide: WidgetService, useValue: {}}],
    }).compileComponents();
    const oFixture = TestBed.createComponent(ImpactsDialogComponent);
    const oDialog = oFixture.componentInstance;
    const oRoot: HTMLElement = oFixture.nativeElement;
    const oTranslate = TestBed.inject(TranslateService);
    oTranslate.setTranslation('en', {IMPACTS_DIALOG: {GO_TO_FEATURE: 'Go to {{name}}'}});
    oTranslate.use('en');
    const oFeature = {name: 'Main Road', type: 'Roads', raw: {}};
    oDialog.m_sActiveTab = 'features';
    oDialog.m_aoImpactRows = [oFeature];
    oDialog.applyImpactTypeFilter();
    const oSelected = spyOn(oDialog.m_oImpactSelected, 'emit');
    oFixture.detectChanges();

    const aoCells = oRoot.querySelectorAll<HTMLTableCellElement>('.sidebar-impact-table tbody td');
    expect(aoCells.length).toBe(2);
    for (const oCell of Array.from(aoCells)) {
      expect(getComputedStyle(oCell).cursor).toBe('pointer');
      expect(oCell.closest('[title]')?.getAttribute('title')).toBe('Go to Main Road');
    }
    aoCells[1].click();
    expect(oSelected).toHaveBeenCalledOnceWith(oFeature);

    oDialog.selectImpactType('Buildings');
    oFixture.detectChanges();
    const oEmptyCell = oRoot.querySelector('.sidebar-impact-table tbody td')!;
    expect(oEmptyCell.textContent).toContain('No features match');
    expect(getComputedStyle(oEmptyCell).cursor).not.toBe('pointer');
  });
});

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
