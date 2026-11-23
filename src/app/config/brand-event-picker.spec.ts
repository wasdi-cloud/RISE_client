import {TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {OverlayContainer} from '@angular/cdk/overlay';
import {TranslateModule} from '@ngx-translate/core';
import {RiseTimebarComponent} from '../components/rise-timebar/rise-timebar.component';

describe('Timebar event picker', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseTimebarComponent, NoopAnimationsModule, TranslateModule.forRoot()],
    }).compileComponents();
  });

  it('lets the user select any event in a cluster instead of navigating to the first', async () => {
    const oFixture = TestBed.createComponent(RiseTimebarComponent);
    oFixture.detectChanges();
    const aoEvents = [
      {name: 'First flood', peakDate: 1794801600},
      {name: 'Second flood', peakDate: 1794801700},
    ];
    oFixture.componentInstance.m_aoEventClusters = [{
      peakDate: aoEvents[0].peakDate, events: aoEvents, isCluster: true, description: 'Two events',
    }];
    const oNavigate = spyOn(oFixture.componentInstance, 'goToEvent');
    oFixture.detectChanges();
    oFixture.nativeElement.querySelector('.event-node').click();
    oFixture.detectChanges();
    await oFixture.whenStable();
    const oOverlay = TestBed.inject(OverlayContainer).getContainerElement();
    const aoChoices = oOverlay.querySelectorAll<HTMLButtonElement>('[mat-menu-item]');
    expect(aoChoices.length).toBe(2);
    expect(aoChoices[0].textContent).toContain('First flood');
    expect(aoChoices[1].textContent).toContain('Second flood');
    expect(aoChoices[1].textContent).toContain('UTC');
    expect(oNavigate).not.toHaveBeenCalled();
    aoChoices[1].click();
    expect(oNavigate).toHaveBeenCalledOnceWith(aoEvents[1], true);
    oFixture.destroy();
  });

  it('keeps single-event navigation direct', () => {
    const oFixture = TestBed.createComponent(RiseTimebarComponent);
    oFixture.detectChanges();
    const oEvent = {name: 'Single flood', peakDate: 1794801600};
    oFixture.componentInstance.m_aoEventClusters = [{
      peakDate: oEvent.peakDate, events: [oEvent], isCluster: false, description: oEvent.name,
    }];
    const oNavigate = spyOn(oFixture.componentInstance, 'goToEvent');
    oFixture.detectChanges();
    oFixture.nativeElement.querySelector('.event-node').click();
    expect(oNavigate).toHaveBeenCalledOnceWith(oEvent, true);
    expect(TestBed.inject(OverlayContainer).getContainerElement().querySelector('[mat-menu-item]')).toBeNull();
    oFixture.destroy();
  });
});
