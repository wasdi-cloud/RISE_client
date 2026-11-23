import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';

import { RiseTimebarComponent } from './rise-timebar.component';

describe('RiseTimebarComponent', () => {
  let component: RiseTimebarComponent;
  let fixture: ComponentFixture<RiseTimebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseTimebarComponent, NoopAnimationsModule, TranslateModule.forRoot()]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseTimebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the Sri Lanka Auto range with distributed month labels', () => {
    fixture.nativeElement.style.display = 'block';
    fixture.nativeElement.style.width = '960px';
    fixture.componentRef.setInput('m_iStartDate', Date.UTC(2025, 9, 6) / 1000);
    fixture.componentRef.setInput('m_iEndDate', Date.UTC(2026, 10, 2, 16, 13, 32) / 1000);
    fixture.detectChanges();
    component.onTimeRangeSelected('Auto');
    fixture.detectChanges();

    const labels: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.tick'));
    expect(labels.map(label => label.textContent.trim())).toEqual([
      'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr',
      'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'
    ]);
    labels.forEach(label => {
      const rect = label.getBoundingClientRect();
      expect(rect.width).withContext(label.textContent).toBeGreaterThan(0);
      expect(rect.height).withContext(label.textContent).toBeGreaterThan(0);
      expect(getComputedStyle(label).visibility).toBe('visible');
    });
    expect(labels[13].getBoundingClientRect().left - labels[0].getBoundingClientRect().left)
      .toBeGreaterThan(800);
  });

  describe('Auto mode date labels', () => {
    beforeEach(() => {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date('2026-11-02T12:00:00Z'));
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('positions historical month labels across the timeline instead of stacking at the right edge', () => {
      fixture.componentRef.setInput('m_iStartDate', Date.UTC(2024, 0, 1) / 1000);
      fixture.componentRef.setInput('m_iEndDate', Date.UTC(2024, 11, 31) / 1000);
      fixture.detectChanges();
      component.onTimeRangeSelected('Auto');
      fixture.detectChanges();

      expect(component.m_aiTicks.map(tick => tick.value)).toEqual([
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ]);
      expect(component.m_aiTicks.map(tick => new Date(tick.timestamp).getUTCFullYear()))
        .toEqual(Array(12).fill(2024));

      const labels: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.tick');
      const positions = Array.from(labels, label => parseFloat(label.style.left));
      expect(labels.length).toBe(12);
      expect(positions[0]).toBe(0);
      expect(positions[11]).toBeLessThan(100);
      expect(positions.every((position, index) => index === 0 || position > positions[index - 1]))
        .toBeTrue();
    });

    it('uses the historical year for daily labels in a single-month range', () => {
      fixture.componentRef.setInput('m_iStartDate', Date.UTC(2024, 1, 27) / 1000);
      fixture.componentRef.setInput('m_iEndDate', Date.UTC(2024, 1, 29) / 1000);
      fixture.detectChanges();
      component.onTimeRangeSelected('Auto');

      expect(component.m_aiTicks).toEqual([
        { value: 27, timestamp: Date.UTC(2024, 1, 27) },
        { value: 28, timestamp: Date.UTC(2024, 1, 28) },
        { value: 29, timestamp: Date.UTC(2024, 1, 29) }
      ]);
      expect(parseFloat(component.getTickPosition(1))).toBeGreaterThan(0);
      expect(parseFloat(component.getTickPosition(1))).toBeLessThan(100);
    });

    it('preserves current-year monthly labels', () => {
      component.m_iStartDate = Date.UTC(2026, 0, 1) / 1000;
      component.m_iEndDate = Date.UTC(2026, 2, 31) / 1000;
      component.generateTicks();

      expect(component.m_aiTicks).toEqual([
        { value: 'Jan', timestamp: Date.UTC(2026, 0, 1) },
        { value: 'Feb', timestamp: Date.UTC(2026, 1, 1) },
        { value: 'Mar', timestamp: Date.UTC(2026, 2, 1) }
      ]);
    });

    [2, 6, 20].forEach(endDay => {
      it(`renders monthly ticks across matching months in different years ending on day ${endDay}`, () => {
        fixture.componentRef.setInput('m_iStartDate', Date.UTC(2025, 10, 6) / 1000);
        fixture.componentRef.setInput('m_iEndDate', Date.UTC(2026, 10, endDay) / 1000);
        fixture.detectChanges();
        component.onTimeRangeSelected('Auto');
        fixture.detectChanges();

        expect(component.m_aiTicks.map(tick => tick.value)).toEqual([
          'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May',
          'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'
        ]);
        expect(component.m_aiTicks.map(tick => tick.timestamp)).toEqual(
          Array.from({length: 13}, (_, index) => Date.UTC(2025, 10 + index, 1))
        );
        expect(fixture.nativeElement.querySelectorAll('.tick').length).toBe(13);

        const positions = component.m_aiTicks.map((_, index) => parseFloat(component.getTickPosition(index)));
        expect(positions.every((position, index) => index === 0 || position > positions[index - 1]))
          .toBeTrue();
      });
    });

    it('logs UTC dates and distinguishes clamped labels from labels within the view', () => {
      spyOn(console, 'groupCollapsed');
      const log = spyOn(console, 'log');
      const table = spyOn(console, 'table');
      spyOn(console, 'groupEnd');
      component.m_iStartDate = Date.UTC(2024, 0, 15) / 1000;
      component.m_iEndDate = Date.UTC(2024, 2, 31) / 1000;

      component.onTimeRangeSelected('Auto');

      expect(log).toHaveBeenCalledWith('Date range (UTC)', jasmine.objectContaining({
        start: '2024-01-15T00:00:00.000Z',
        end: '2024-03-31T00:00:00.000Z',
        tickCount: 3
      }));
      expect(table).toHaveBeenCalledOnceWith([
        jasmine.objectContaining({
          label: 'Jan',
          dateUTC: '2024-01-01T00:00:00.000Z',
          renderedPosition: '0%',
          placement: 'Clamped to left edge'
        }),
        jasmine.objectContaining({ label: 'Feb', placement: 'Within view' }),
        jasmine.objectContaining({ label: 'Mar', placement: 'Within view' })
      ]);

      table.calls.reset();
      fixture.detectChanges();
      expect(table).not.toHaveBeenCalled();
    });
  });
});
