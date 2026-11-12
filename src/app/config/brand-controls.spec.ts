import {TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateModule} from '@ngx-translate/core';
import {RiseButtonComponent} from '../components/rise-button/rise-button.component';
import {RiseTimebarComponent} from '../components/rise-timebar/rise-timebar.component';

for (const sBrand of ['rise', 'emergency']) {
  describe(`${sBrand} shared controls`, () => {
    let sOriginalBrand: string | null;

    beforeEach(async () => {
      sOriginalBrand = document.documentElement.getAttribute('data-brand');
      document.documentElement.setAttribute('data-brand', sBrand);
      await TestBed.configureTestingModule({
        imports: [
          RiseButtonComponent, RiseTimebarComponent,
          NoopAnimationsModule, TranslateModule.forRoot(),
        ],
      }).compileComponents();
    });

    afterEach(() => {
      if (sOriginalBrand === null) {
        document.documentElement.removeAttribute('data-brand');
      } else {
        document.documentElement.setAttribute('data-brand', sOriginalBrand);
      }
    });

    it('renders the primary action with contrasting text', () => {
      const oFixture = TestBed.createComponent(RiseButtonComponent);
      oFixture.componentRef.setInput('m_sRole', 'primary');
      oFixture.detectChanges();
      const oButton = getComputedStyle(oFixture.nativeElement.querySelector('button'));

      expect(oButton.backgroundColor).toBe(sBrand === 'emergency'
        ? 'rgb(185, 28, 28)' : 'rgb(255, 255, 255)');
      expect(oButton.color).toBe(sBrand === 'emergency'
        ? 'rgb(255, 255, 255)' : 'rgba(0, 0, 0, 0.95)');
    });

    it('themes the timebar surface without changing its controls', () => {
      const oFixture = TestBed.createComponent(RiseTimebarComponent);
      oFixture.detectChanges();
      const oContainer = getComputedStyle(oFixture.nativeElement.querySelector('.timebar-container'));
      const oLivePill = getComputedStyle(oFixture.nativeElement.querySelector('.live-pill'));

      expect(oContainer.backgroundColor).toBe(sBrand === 'emergency'
        ? 'rgba(255, 255, 255, 0.97)' : 'rgba(0, 31, 40, 0.8)');
      expect(oLivePill.color).toBe(sBrand === 'emergency'
        ? 'rgb(159, 18, 57)' : 'rgb(255, 99, 132)');
      expect(oFixture.componentInstance.m_bIsLive).toBeTrue();
      expect(oFixture.nativeElement.querySelectorAll('.segment-btn').length).toBe(5);
    });
  });
}
