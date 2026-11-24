import {TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateModule} from '@ngx-translate/core';
import {RiseButtonComponent} from '../components/rise-button/rise-button.component';
import {RiseTimebarComponent} from '../components/rise-timebar/rise-timebar.component';
import {RiseDateInputComponent} from '../components/rise-date-input/rise-date-input.component';
import {provideRouter} from '@angular/router';
import {RiseAooWidgetComponent} from '../views/dashboard/rise-aoo-widget/rise-aoo-widget.component';
import {RiseBadgeComponent} from '../components/rise-badge/rise-badge.component';
import {PrintMapDialogComponent} from '../dialogs/print-map-dialog/print-map-dialog.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {provideHttpClient} from '@angular/common/http';
import {PrinterService} from '../services/api/printer.service';

for (const sBrand of ['rise', 'emergency']) {
  describe(`${sBrand} shared controls`, () => {
    let sOriginalBrand: string | null;

    beforeEach(async () => {
      sOriginalBrand = document.documentElement.getAttribute('data-brand');
      document.documentElement.setAttribute('data-brand', sBrand);
      await TestBed.configureTestingModule({
        imports: [
          RiseButtonComponent, RiseTimebarComponent, RiseDateInputComponent, RiseAooWidgetComponent, RiseBadgeComponent,
          PrintMapDialogComponent, NoopAnimationsModule, TranslateModule.forRoot(),
        ],
        providers: [
          provideRouter([]), provideHttpClient(),
          {provide: MAT_DIALOG_DATA, useValue: {payload: {}}},
          {provide: MatDialogRef, useValue: {}},
          {provide: PrinterService, useValue: {}},
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

    it('preserves the Emergency monitor logo proportions without changing standard RISE sizing', async () => {
      const oMonitor = document.createElement('main');
      oMonitor.className = 'monitor-page';
      oMonitor.style.cssText = 'display: flex; width: 320px';
      const oLogo = document.createElement('img');
      oLogo.className = 'logo-img';
      oLogo.setAttribute('width', '35%');
      oLogo.style.height = '24px';
      oLogo.src = 'assets/rise-assets/emergency-logo-cropped.png';
      oMonitor.appendChild(oLogo);
      document.body.appendChild(oMonitor);
      try {
        await oLogo.decode();
        const oBounds = oLogo.getBoundingClientRect();
        expect(oBounds.height).toBe(24);
        expect(oBounds.width).toBeCloseTo(sBrand === 'emergency'
          ? 24 * oLogo.naturalWidth / oLogo.naturalHeight
          : 320 * 0.35, 1);
        if (sBrand === 'emergency') {
          expect(getComputedStyle(oLogo).flexShrink).toBe('0');
        }
      } finally {
        oMonitor.remove();
      }
    });

    it('matches the Emergency dashboard logo to the monitor and retains the collapsed mini logo', async () => {
      if (sBrand !== 'emergency') {
        return;
      }
      const oContainer = document.createElement('div');
      oContainer.innerHTML = `
        <div class="rise-sidebar" style="width: 320px">
          <a class="dashboard-home-link" style="display: inline-block; height: 24px">
            <img riseBrandLogo class="dashboard-logo" src="assets/rise-assets/emergency-logo-cropped.png">
          </a>
        </div>
        <main class="monitor-page">
          <img class="logo-img" src="assets/rise-assets/emergency-logo-cropped.png">
        </main>`;
      document.body.appendChild(oContainer);
      try {
        const oDashboard = oContainer.querySelector<HTMLImageElement>('.dashboard-logo')!;
        const oMonitor = oContainer.querySelector<HTMLImageElement>('.logo-img')!;
        await Promise.all([oDashboard.decode(), oMonitor.decode()]);
        expect(oDashboard.getBoundingClientRect().height).toBe(24);
        expect(oDashboard.getBoundingClientRect().width)
          .toBeCloseTo(oMonitor.getBoundingClientRect().width, 1);
        expect(oContainer.querySelector('.dashboard-home-link')!.getBoundingClientRect().width)
          .toBeCloseTo(oMonitor.getBoundingClientRect().width, 1);
        oContainer.querySelector('.rise-sidebar')!.classList.add('collapsed');
        oDashboard.src = 'assets/rise-assets/emergency-logo-mini.png';
        await oDashboard.decode();
        expect(oDashboard.getBoundingClientRect().width).toBe(30);
        expect(oDashboard.getBoundingClientRect().height).toBe(24);
        expect(getComputedStyle(oDashboard).objectFit).toBe('contain');
      } finally {
        oContainer.remove();
      }
    });

    it('keeps event upload and attachment labels readable on the monitor surface', () => {
      const oMonitor = document.createElement('main');
      oMonitor.className = 'monitor-page';
      oMonitor.innerHTML = `
        <style>
          /* The branding runner omits Bootstrap; reproduce its relevant base declarations. */
          .monitor-page .text-light { color: rgb(248, 249, 250) !important; }
          .monitor-page .text-muted { color: rgba(33, 37, 41, 0.75) !important; }
          .monitor-page .btn-outline-light { --bs-btn-color: #f8f9fa; }
          .monitor-page .btn { color: var(--bs-btn-color); }
        </style>
        <div class="event-quick-upload">
          <button class="btn btn-outline-light">Image / Video</button>
          <span class="text-light">Selected file</span>
          <span class="text-light">Click the map to drop a pin, then click Upload!</span>
        </div>
        <div class="event-attachments">
          <span class="text-light">Attachments</span>
          <button class="sidebar-sort-button text-light">Newest</button>
          <button class="sidebar-sort-button text-muted">A-Z</button>
        </div>`;
      document.body.appendChild(oMonitor);
      try {
        for (const oLabel of Array.from(oMonitor.querySelectorAll('.text-light, .btn-outline-light'))) {
          expect(getComputedStyle(oLabel).color).toBe(sBrand === 'emergency'
            ? 'rgb(41, 37, 36)' : 'rgb(248, 249, 250)');
        }
        if (sBrand === 'emergency') {
          expect(getComputedStyle(oMonitor.querySelector('.text-muted')!).color).toBe('rgb(87, 83, 78)');
          const oButtonStyle = getComputedStyle(oMonitor.querySelector('.btn-outline-light')!);
          expect(oButtonStyle.getPropertyValue('--bs-btn-hover-color').trim()).toBe('#292524');
          expect(oButtonStyle.getPropertyValue('--bs-btn-active-color').trim()).toBe('#292524');
        }
        const oSort = oMonitor.querySelector('.sidebar-sort-button')!;
        oSort.classList.replace('text-light', 'text-muted');
        if (sBrand === 'emergency') {
          expect(getComputedStyle(oSort).color).toBe('rgb(87, 83, 78)');
        }
      } finally {
        oMonitor.remove();
      }
    });

    it('keeps print format icons and labels readable before and after selection', () => {
      const oFixture = TestBed.createComponent(PrintMapDialogComponent);
      const oHost = document.createElement('app-print-map-dialog');
      document.body.appendChild(oHost);
      oHost.appendChild(oFixture.nativeElement);
      try {
        oFixture.detectChanges();
        const aoOptions: NodeListOf<HTMLElement> = oHost.querySelectorAll('.format-option');
        const checkColors = () => {
          for (const oOption of Array.from(aoOptions)) {
            for (const oLabel of Array.from(oOption.querySelectorAll('.format-icon, .format-label'))) {
              expect(getComputedStyle(oLabel).color).toBe(
                sBrand === 'emergency' && !oOption.classList.contains('active')
                  ? 'rgb(87, 83, 78)' : 'rgb(255, 255, 255)');
            }
          }
        };
        expect(aoOptions.length).toBe(2);
        checkColors();
        aoOptions[1].click();
        oFixture.detectChanges();
        expect(oFixture.componentInstance.m_sSelectedFormat).toBe('png');
        checkColors();
      } finally {
        oFixture.destroy();
        oHost.remove();
      }
    });

    it('keeps the attachment preview title, actions and loading message readable', () => {
      const oPreview = document.createElement('div');
      oPreview.className = 'attachment-preview-dialog';
      oPreview.innerHTML = `
        <style>.attachment-preview-dialog .text-light { color: #f8f9fa !important; }</style>
        <span class="file-name text-light">Image title</span>
        <span class="file-icon text-light">download</span>
        <span class="file-icon text-light">close</span>
        <div class="text-light">Loading Preview...</div>`;
      document.body.appendChild(oPreview);
      try {
        for (const oLabel of Array.from(oPreview.querySelectorAll('.text-light'))) {
          expect(getComputedStyle(oLabel).color).toBe(sBrand === 'emergency'
            ? 'rgb(41, 37, 36)' : 'rgb(248, 249, 250)');
        }
      } finally {
        oPreview.remove();
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

    it('keeps delete button labels readable on the danger background', () => {
      const oFixture = TestBed.createComponent(RiseButtonComponent);
      const oHost = document.createElement('rise-button');
      document.body.appendChild(oHost);
      oHost.appendChild(oFixture.nativeElement);
      try {
        oFixture.componentRef.setInput('m_sRole', 'danger');
        oFixture.componentRef.setInput('m_sLabel', 'Delete');
        oFixture.detectChanges();
        const oButton = oHost.querySelector('button')!;
        expect(getComputedStyle(oButton).color).toBe(sBrand === 'emergency'
          ? 'rgb(255, 255, 255)' : 'rgba(255, 255, 255, 0.9)');
      } finally {
        oFixture.destroy();
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

    it('shows exact nonzero counts in the corner of collapsed event and alert tiles', () => {
      const oSidebar = document.createElement('div');
      oSidebar.className = 'rise-sidebar collapsed';
      oSidebar.style.width = '64px';
      oSidebar.innerHTML = `
        <rise-ongoing-widget><div class="widget-card"><div class="widget-header">
          <rise-badge></rise-badge>
        </div></div></rise-ongoing-widget>
        <rise-alerts-widget><div class="widget-card"><div class="widget-header">
          <rise-badge></rise-badge>
        </div></div></rise-alerts-widget>`;
      document.body.appendChild(oSidebar);
      try {
        const aoHosts = Array.from(oSidebar.querySelectorAll('rise-badge'));
        for (const [iIndex, oHost] of aoHosts.entries()) {
          const oFixture = TestBed.createComponent(RiseBadgeComponent);
          oHost.appendChild(oFixture.nativeElement);
          expect(getComputedStyle(oHost).display).toBe('none');

          const iCount = iIndex === 0 ? 7 : 123;
          oFixture.componentRef.setInput('m_iDisplayNum', iCount);
          oHost.classList.add('has-items');
          oFixture.detectChanges();
          const oBadge = oHost.querySelector('.rise-badge')!;
          const oBadgeStyle = getComputedStyle(oBadge);
          expect(oBadge.textContent!.trim()).toBe(String(iCount));
          expect(oBadgeStyle.fontSize).toBe('10px');
          const oTile = oHost.parentElement!.getBoundingClientRect();
          const oBounds = oBadge.getBoundingClientRect();
          expect(oTile.right - oBounds.right).toBeCloseTo(3);
          expect(oBounds.top - oTile.top).toBeCloseTo(2);
          expect(oBounds.width).toBeGreaterThanOrEqual(iCount === 7 ? 14 : 20);
          expect(oBadgeStyle.backgroundColor).toBe(sBrand === 'emergency'
            ? 'rgb(185, 28, 28)' : 'rgb(239, 186, 53)');
          expect(oBadgeStyle.color).toBe(sBrand === 'emergency'
            ? 'rgb(255, 255, 255)' : 'rgba(0, 0, 0, 0.95)');
          oFixture.destroy();
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
          <div class="leaflet-control-geocoder-form"><input aria-label="Search"></div>
        </div>
        <div class="leaflet-control-layers">
          <a class="leaflet-control-layers-toggle"></a>
        </div>`;
      document.body.appendChild(oContainer);

      try {
        for (const bExpanded of [false, true]) {
          oContainer.querySelector('.leaflet-control-geocoder')!
            .classList.toggle('leaflet-control-geocoder-expanded', bExpanded);
          const oForm = oContainer.querySelector<HTMLElement>('.leaflet-control-geocoder-form')!;
          // Match the plugin's layout; its stylesheet is not loaded by the branding runner.
          oForm.style.display = bExpanded ? 'inline-block' : 'none';
          oForm.style.verticalAlign = 'middle';
          for (const sSelector of ['.leaflet-control-geocoder-icon', '.leaflet-control-layers-toggle']) {
            const oControl = oContainer.querySelector(sSelector)!;
            const oStyle = getComputedStyle(oControl);
            if (sBrand === 'emergency') {
              expect(oStyle.backgroundColor).toBe('rgb(255, 255, 255)');
              expect(oStyle.backgroundImage).toBe('none');
              const oIconStyle = getComputedStyle(oControl, '::before');
              expect(oIconStyle.backgroundColor).toBe('rgb(41, 37, 36)');
              expect(oIconStyle.width).toBe(sSelector === '.leaflet-control-layers-toggle' ? '20px' : '24px');
              if (sSelector === '.leaflet-control-geocoder-icon') {
                expect(oStyle.position).toBe('relative');
                expect(oStyle.display).toBe('inline-grid');
                expect(oStyle.verticalAlign).toBe('middle');
                expect(oStyle.width).toBe('36px');
                expect(oStyle.height).toBe('36px');
                const oButtonBounds = oControl.getBoundingClientRect();
                expect(parseFloat(oIconStyle.width)).toBeLessThan(oButtonBounds.width);
                expect(parseFloat(oIconStyle.height)).toBeLessThan(oButtonBounds.height);
                if (bExpanded) {
                  const oFormBounds = oForm.getBoundingClientRect();
                  expect(oFormBounds.left).toBeGreaterThanOrEqual(oButtonBounds.right);
                  expect(oFormBounds.top).toBeLessThan(oButtonBounds.bottom);
                  expect(oFormBounds.bottom).toBeGreaterThan(oButtonBounds.top);
                }
              }
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

    it('keeps dark geocoder result text readable on the Emergency keyboard highlight', () => {
      const oControl = document.createElement('div');
      oControl.className = 'leaflet-control-geocoder leaflet-bar';
      oControl.innerHTML = `
        <ul class="leaflet-control-geocoder-alternatives">
          <li><a href="#">Luxembourg <span class="leaflet-control-geocoder-address-context">City</span></a></li>
        </ul>`;
      document.body.appendChild(oControl);
      try {
        const oResult = oControl.querySelector('li')!;
        expect(getComputedStyle(oResult).backgroundColor).toBe('rgba(0, 0, 0, 0)');
        oResult.classList.add('leaflet-control-geocoder-selected');
        expect(getComputedStyle(oResult).backgroundColor).toBe(sBrand === 'emergency'
          ? 'rgb(214, 211, 209)' : 'rgba(0, 0, 0, 0)');
        if (sBrand === 'emergency') {
          expect(getComputedStyle(oResult.querySelector('a')!).color).toBe('rgb(41, 37, 36)');
        }
        expect(getComputedStyle(oResult.querySelector('a')!).backgroundColor).toBe('rgba(0, 0, 0, 0)');
      } finally {
        oControl.remove();
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
