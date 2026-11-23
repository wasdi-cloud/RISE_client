import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateModule} from '@ngx-translate/core';
import {RiseTimebarComponent} from '../components/rise-timebar/rise-timebar.component';

describe('Timebar visual event clustering', () => {
  let oFixture: ComponentFixture<RiseTimebarComponent>;
  let oComponent: RiseTimebarComponent;
  let iWidth: number;
  let onResize: ResizeObserverCallback;
  let oObserver: jasmine.SpyObj<ResizeObserver>;
  const iDay = 86400;
  const iStart = Date.UTC(2025, 0, 1) / 1000;

  beforeEach(async () => {
    oObserver = jasmine.createSpyObj<ResizeObserver>('ResizeObserver', ['observe', 'disconnect', 'unobserve']);
    spyOn(window, 'ResizeObserver').and.callFake(function(oCallback: ResizeObserverCallback) {
      onResize = oCallback;
      return oObserver;
    });
    await TestBed.configureTestingModule({
      imports: [RiseTimebarComponent, NoopAnimationsModule, TranslateModule.forRoot()],
    }).compileComponents();
    oFixture = TestBed.createComponent(RiseTimebarComponent);
    oFixture.detectChanges();
    oComponent = oFixture.componentInstance;
    iWidth = 1000;
    spyOnProperty(oComponent.slider.nativeElement, 'clientWidth').and.callFake(() => iWidth);
    oComponent.m_asDates = ['2025-01-01', '2025-12-31'];
  });

  afterEach(() => oFixture.destroy());

  it('joins the Oct 29, Nov 2, and Nov 4 chain and centers it between the endpoints', () => {
    const aoEvents = [29, 33, 35].map(iDayOfOctober => ({
      name: `Event ${iDayOfOctober}`,
      peakDate: Date.UTC(2025, 9, iDayOfOctober) / 1000,
    }));
    oComponent.m_aoEvents = [aoEvents[2], aoEvents[0], aoEvents[1]];
    const aoClusters = oComponent.getClusteredEvents();
    expect(aoClusters.length).toBe(1);
    expect(aoClusters[0].events).toEqual(aoEvents);
    expect(aoClusters[0].isCluster).toBeTrue();
    expect(aoClusters[0].peakDate).toBe((aoEvents[0].peakDate + aoEvents[2].peakDate) / 2);
    expect(oComponent.m_aoEvents[0]).toBe(aoEvents[2]);
  });

  it('starts another cluster when a consecutive gap exceeds 24 pixels', () => {
    oComponent.m_aoEvents = [0, 4, 6, 20].map(iOffset => ({peakDate: iStart + iOffset * iDay}));
    expect(oComponent.getClusteredEvents().map(oCluster => oCluster.events.length)).toEqual([3, 1]);
  });

  for (const [sRange, iDuration] of [
    ['Auto', 365 * iDay], ['1Y', 365 * iDay], ['1M', 30 * iDay],
    ['1W', 7 * iDay], ['1D', iDay],
  ] as const) {
    it(`uses the current screen-distance threshold in ${sRange}`, () => {
      oComponent.m_sSelectedTimeRange = sRange;
      oComponent.m_asDates = [
        new Date(iStart * 1000).toISOString(),
        new Date((iStart + iDuration) * 1000).toISOString(),
      ];
      const iThreshold = iDuration * 24 / iWidth;
      oComponent.m_aoEvents = [0, 0.9, 1.8, 3].map(iFactor => ({
        peakDate: iStart + iFactor * iThreshold,
      }));
      const aoClusters = oComponent.getClusteredEvents();
      expect(aoClusters.map(oCluster => oCluster.events.length)).toEqual([3, 1]);
      expect(aoClusters[0].peakDate).toBeCloseTo(iStart + 0.9 * iThreshold, 4);
    });
  }

  it('splits the same events when changing from a yearly to a monthly view', () => {
    oComponent.m_aoEvents = [1, 5, 7].map(iDate => ({peakDate: Date.UTC(2025, 10, iDate) / 1000}));
    expect(oComponent.getClusteredEvents().length).toBe(1);
    oComponent.m_asDates = ['2025-11-01', '2025-11-30'];
    expect(oComponent.getClusteredEvents().length).toBe(3);
  });

  it('recalculates after layout changes and disconnects its observer on destruction', () => {
    oComponent.m_aoEvents = [0, 4, 6].map(iOffset => ({peakDate: iStart + iOffset * iDay}));
    onResize([], oObserver);
    expect(oComponent.m_aoEventClusters.length).toBe(1);
    iWidth = 4000;
    onResize([], oObserver);
    expect(oComponent.m_aoEventClusters.length).toBe(2);
    expect(oObserver.observe).toHaveBeenCalledWith(oComponent.slider.nativeElement);
    oFixture.destroy();
    expect(oObserver.disconnect).toHaveBeenCalled();
  });

  it('keeps exact-date duplicates together and excludes events outside the view', () => {
    oComponent.m_aoEvents = [
      {peakDate: iStart - iDay}, {peakDate: iStart}, {peakDate: iStart},
      {peakDate: Date.UTC(2026, 0, 1) / 1000},
    ];
    iWidth = 0;
    const aoClusters = oComponent.getClusteredEvents();
    expect(aoClusters.length).toBe(1);
    expect(aoClusters[0].events.length).toBe(2);
    expect(aoClusters[0].peakDate).toBe(iStart);
  });
});
