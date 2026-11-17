import {TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateModule} from '@ngx-translate/core';
import {RiseButtonComponent} from '../components/rise-button/rise-button.component';
import {RiseTimebarComponent} from '../components/rise-timebar/rise-timebar.component';
import {RiseDateInputComponent} from '../components/rise-date-input/rise-date-input.component';
import {provideRouter} from '@angular/router';
import {RiseAooWidgetComponent} from '../views/dashboard/rise-aoo-widget/rise-aoo-widget.component';
import {RiseBadgeComponent} from '../components/rise-badge/rise-badge.component';

for (const sBrand of ['rise', 'emergency']) {
  describe(`${sBrand} shared controls`, () => {
    let sOriginalBrand: string | null;

    beforeEach(async () => {
      sOriginalBrand = document.documentElement.getAttribute('data-brand');
      document.documentElement.setAttribute('data-brand', sBrand);
      await TestBed.configureTestingModule({
        imports: [
          RiseButtonComponent, RiseTimebarComponent, RiseDateInputComponent, RiseAooWidgetComponent, RiseBadgeComponent,
          NoopAnimationsModule, TranslateModule.forRoot(),
        ],
        providers: [provideRouter([])],
      }).compileComponents();
    });

    afterEach(() => {
      if (sOriginalBrand === null) {
        document.documentElement.removeAttribute('data-brand');
      } else {
        document.documentElement.setAttribute('data-brand', sOriginalBrand);
      }
    });

    it('themes the area toggle without changing its behavior or standard RISE color', () => {
      const oFixture = TestBed.createComponent(RiseAooWidgetComponent);
      const oHost = document.createElement('rise-aoo-widget');
      document.body.appendChild(oHost);
      oHost.appendChild(oFixture.nativeElement);
      try {
        oFixture.detectChanges();
        const oInput: HTMLInputElement = oFixture.nativeElement.querySelector('input');
        const oSlider = oFixture.nativeElement.querySelector('.ui-slider');
        oSlider.style.transition = 'none';
        expect(oInput.checked).toBeTrue();
        expect(getComputedStyle(oSlider).backgroundColor).toBe(sBrand === 'emergency'
          ? 'rgb(185, 28, 28)' : 'rgb(52, 211, 153)');
        const oPublicIcon = document.createElement('span');
        oPublicIcon.className = 'privacy-icon public';
        oHost.appendChild(oPublicIcon);
        if (sBrand === 'emergency') {
          expect(getComputedStyle(oPublicIcon).color).toBe('rgb(87, 83, 78)');
        }
        const oToggle = spyOn(oFixture.componentInstance.m_oTogglePublic, 'emit');
        oInput.click();
        expect(oToggle).toHaveBeenCalledTimes(1);
        oFixture.componentRef.setInput('m_bShowPublicAoOs', false);
        oFixture.detectChanges();
        expect(getComputedStyle(oSlider).backgroundColor).not.toBe('rgb(185, 28, 28)');
      } finally {
        oHost.remove();
      }
    });

    it('uses compact mockup count badges only in the expanded Emergency sidebar', () => {
      const oFixture = TestBed.createComponent(RiseBadgeComponent);
      const oSidebar = document.createElement('div');
      oSidebar.className = 'rise-sidebar';
      const oHeader = document.createElement('div');
      oHeader.className = 'widget-header';
      const oHost = document.createElement('rise-badge');
      oHeader.appendChild(oHost);
      oSidebar.appendChild(oHeader);
      document.body.appendChild(oSidebar);
      oHost.appendChild(oFixture.nativeElement);
      try {
        oFixture.detectChanges();
        const oBadge = oFixture.nativeElement.querySelector('.rise-badge');
        expect(getComputedStyle(oBadge).fontSize).toBe(sBrand === 'emergency' ? '10px' : '12px');
        if (sBrand === 'emergency') {
          expect(getComputedStyle(oBadge).backgroundColor).toBe('rgb(243, 244, 246)');
          oHost.classList.add('has-items');
          oFixture.componentRef.setInput('m_iDisplayNum', 9);
          oFixture.detectChanges();
          expect(oBadge.textContent.trim()).toBe('9');
          expect(getComputedStyle(oBadge).backgroundColor).toBe('rgb(254, 242, 242)');
          expect(getComputedStyle(oBadge).color).toBe('rgb(185, 28, 28)');
          oSidebar.classList.add('collapsed');
          expect(getComputedStyle(oBadge).backgroundColor).not.toBe('rgb(254, 242, 242)');
        }
      } finally {
        oSidebar.remove();
      }
    });

    it('keeps Emergency alert metrics aligned without a nested card', () => {
      const oWidget = document.createElement('rise-alerts-widget');
      oWidget.innerHTML = `
        <div class="alert-heading"><div class="alert-title">Flood - Luxembourg</div></div>
        <div class="alert-metric" style="display: flex; align-items: center; gap: 8px">
          <span class="body-icon">add_road</span><div class="alert-content">12 km</div>
        </div>`;
      document.body.appendChild(oWidget);
      try {
        const oMetric = getComputedStyle(oWidget.querySelector('.alert-metric')!);
        expect(oMetric.display).toBe('flex');
        expect(oMetric.flexWrap).toBe('nowrap');
        if (sBrand === 'emergency') {
          expect(oMetric.padding).toBe('0px');
          expect(oMetric.borderTopStyle).toBe('none');
          expect(getComputedStyle(oWidget.querySelector('.body-icon')!).fontSize).toBe('20px');
          expect(getComputedStyle(oWidget.querySelector('.alert-content')!).fontSize).toBe('13px');
        }
      } finally {
        oWidget.remove();
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
      for (const oButton of oFixture.nativeElement.querySelectorAll('.segment-btn')) {
        expect(getComputedStyle(oButton).fontWeight).toBe('400');
        expect(getComputedStyle(oButton).fontSize).toBe('13px');
        expect(getComputedStyle(oButton).paddingLeft).toBe('12px');
        expect(oButton.getBoundingClientRect().height).toBeGreaterThanOrEqual(32);
      }
      expect(getComputedStyle(oFixture.nativeElement.querySelector('.calendar-text-group')).fontWeight)
        .toBe('400');
      expect(oFixture.nativeElement.querySelector('.calendar-toggle svg[matDatepickerToggleIcon]'))
        .not.toBeNull();
    });

    it('keeps map search and basemap buttons readable on their themed surfaces', () => {
      const oContainer = document.createElement('div');
      oContainer.className = 'leaflet-touch';
      oContainer.innerHTML = `
        <div class="leaflet-control-geocoder">
          <button class="leaflet-control-geocoder-icon"></button>
        </div>
        <div class="leaflet-control-layers">
          <a class="leaflet-control-layers-toggle"></a>
        </div>`;
      document.body.appendChild(oContainer);

      try {
        for (const bExpanded of [false, true]) {
          oContainer.querySelector('.leaflet-control-geocoder')!
            .classList.toggle('leaflet-control-geocoder-expanded', bExpanded);
          for (const sSelector of ['.leaflet-control-geocoder-icon', '.leaflet-control-layers-toggle']) {
            const oControl = oContainer.querySelector(sSelector)!;
            const oStyle = getComputedStyle(oControl);
            if (sBrand === 'emergency') {
              expect(oStyle.backgroundColor).toBe('rgb(255, 255, 255)');
              expect(oStyle.backgroundImage).toBe('none');
              const oIconStyle = getComputedStyle(oControl, '::before');
              expect(oIconStyle.backgroundColor).toBe('rgb(41, 37, 36)');
              expect(oIconStyle.width).toBe(sSelector === '.leaflet-control-layers-toggle' ? '20px' : '24px');
            } else {
              expect(oStyle.backgroundImage).toBe('none');
              expect(oStyle.backgroundColor).not.toBe('rgb(255, 255, 255)');
            }
          }
        }
      } finally {
        oContainer.remove();
      }
    });

    it('hides the initial search message and shows feedback only for a failed search', () => {
      const oControl = document.createElement('div');
      oControl.className = 'leaflet-control-geocoder';
      oControl.innerHTML = '<div class="leaflet-control-geocoder-form-no-error">Nothing found.</div>';
      document.body.appendChild(oControl);
      try {
        const oMessage = oControl.firstElementChild!;
        expect(getComputedStyle(oMessage).display).toBe('none');
        oControl.classList.add('leaflet-control-geocoder-expanded');
        expect(getComputedStyle(oMessage).display).toBe('none');
        oControl.classList.add('leaflet-control-geocoder-options-error');
        oMessage.classList.add('leaflet-control-geocoder-error');
        expect(getComputedStyle(oMessage).display).toBe('block');
        oControl.classList.remove('leaflet-control-geocoder-options-error');
        oMessage.classList.remove('leaflet-control-geocoder-error');
        expect(getComputedStyle(oMessage).display).toBe('none');
      } finally {
        oControl.remove();
      }
    });

    it('uses local outline map icons without intercepting button clicks', () => {
      const oContainer = document.createElement('div');
      oContainer.className = 'leaflet-touch leaflet-bar';
      oContainer.innerHTML = `
        <button class="leaflet-control-geocoder-icon" aria-label="Search"></button>
        <a class="leaflet-control-button leaflet-control-measure" title="Start Measurement"><span>architecture</span></a>
        <a class="leaflet-control-zoom-in" aria-label="Zoom in"><span>+</span></a>
        <a class="leaflet-control-zoom-out" aria-label="Zoom out"><span>-</span></a>
        <a class="leaflet-control-coordinates" title="Search by Coordinates"><span>travel_explore</span></a>
        <a class="leaflet-control-layers-toggle" title="Layers"></a>`;
      document.body.appendChild(oContainer);

      try {
        const asIcons = ['map-search.svg', 'map-ruler.svg', 'map-plus.svg', 'map-minus.svg',
          'map-coordinates.svg', 'map-layers.svg'];
        Array.from(oContainer.children).forEach((oControl, iIndex) => {
          const oStyle = getComputedStyle(oControl, '::before');
          expect(oStyle.getPropertyValue('mask-image') || oStyle.getPropertyValue('-webkit-mask-image'))
            .toContain(asIcons[iIndex]);
          expect(oStyle.pointerEvents).toBe('none');
          const oClick = jasmine.createSpy('click');
          oControl.addEventListener('click', oClick);
          (oControl as HTMLElement).click();
          expect(oClick).toHaveBeenCalledTimes(1);
        });
        expect(oContainer.querySelector('.leaflet-control-zoom-in')!.getAttribute('aria-label'))
          .toBe('Zoom in');
      } finally {
        oContainer.remove();
      }
    });

    it('separates emergency sidebar cards with gray borders in both sidebar states', () => {
      const oSidebar = document.createElement('div');
      oSidebar.className = 'rise-sidebar';
      oSidebar.innerHTML = '<div class="widget-card"></div><div class="banner-card"></div>';
      document.body.appendChild(oSidebar);

      try {
        for (const bCollapsed of [false, true]) {
          oSidebar.classList.toggle('collapsed', bCollapsed);
          for (const oCard of Array.from(oSidebar.children)) {
            const sBorder = getComputedStyle(oCard).borderTopColor;
            if (sBrand === 'emergency') {
              expect(sBorder).toBe('rgb(214, 211, 209)');
            } else {
              expect(sBorder).not.toBe('rgb(214, 211, 209)');
            }
          }
        }
      } finally {
        oSidebar.remove();
      }
    });

    it('lightens monitor control icons without revealing replaced glyphs', () => {
      const oMonitor = document.createElement('main');
      oMonitor.className = 'monitor-page';
      oMonitor.innerHTML = `
        <div class="leaflet-control">
          <a class="leaflet-control-button"><span class="material-symbols-outlined">pinch</span></a>
          <a class="leaflet-control-measure"><span class="material-symbols-outlined">architecture</span></a>
        </div>
        <div class="button-container"><rise-button><span class="material-symbols-outlined">event_note</span></rise-button></div>`;
      document.body.appendChild(oMonitor);
      try {
        const aoIcons = oMonitor.querySelectorAll('.material-symbols-outlined');
        expect(getComputedStyle(aoIcons[0]).fontWeight).toBe('300');
        expect(getComputedStyle(aoIcons[0]).fontSize).toBe('20px');
        expect(getComputedStyle(aoIcons[1]).fontSize).toBe('0px');
        expect(getComputedStyle(aoIcons[2]).fontWeight).toBe('300');
        expect(getComputedStyle(aoIcons[2]).fontSize).toBe('20px');
      } finally {
        oMonitor.remove();
      }
    });

    it('uses only the native date picker icon for emergency date fields', () => {
      const oFixture = TestBed.createComponent(RiseDateInputComponent);
      oFixture.detectChanges();
      const oHost = document.createElement('rise-date-input');
      document.body.appendChild(oHost);
      oHost.appendChild(oFixture.nativeElement);
      try {
        expect(oFixture.nativeElement.querySelector('input').type).toBe('date');
        expect(getComputedStyle(oFixture.nativeElement.querySelector('.calendar-icon')).display)
          .toBe(sBrand === 'emergency' ? 'none' : 'block');
      } finally {
        oHost.remove();
      }
    });

    it('keeps emergency drawing buttons separated with dark icons on white', () => {
      const oContainer = document.createElement('div');
      oContainer.className = 'leaflet-touch';
      oContainer.innerHTML = `<div class="leaflet-bar leaflet-draw-toolbar">
        <a class="leaflet-draw-draw-rectangle"></a>
        <a class="leaflet-draw-draw-circle"></a>
        <a class="leaflet-draw-edit-remove leaflet-control-button"><span>delete</span></a>
      </div>`;
      document.body.appendChild(oContainer);
      try {
        if (sBrand === 'emergency') {
          expect(getComputedStyle(oContainer.firstElementChild!).gap).toBe('8px');
          for (const oButton of Array.from(oContainer.querySelectorAll('a'))) {
            const oStyle = getComputedStyle(oButton);
            expect(oStyle.backgroundColor).toBe('rgb(255, 255, 255)');
            expect(oStyle.color).toBe('rgb(41, 37, 36)');
            expect(oStyle.backgroundImage).toBe('none');
            expect(oStyle.width).toBe('36px');
            expect(oStyle.marginTop).toBe('0px');
          }
          expect(getComputedStyle(oContainer.querySelector('a')!, '::before')
            .getPropertyValue('mask-image')).toContain('square-icon.svg');
        } else {
          expect(getComputedStyle(oContainer.querySelector('a')!).backgroundImage)
            .toContain('square-icon.svg');
        }
      } finally {
        oContainer.remove();
      }
    });
  });
}
