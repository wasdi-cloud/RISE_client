import {TestBed} from '@angular/core/testing';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {localizeMapControls} from '../services/map-control-i18n';

describe('Shared map control localization', () => {
  let oTranslate: TranslateService;
  let oContainer: HTMLDivElement;
  let stopLocalizing: () => void;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [TranslateModule.forRoot()]});
    oTranslate = TestBed.inject(TranslateService);
    oTranslate.setTranslation('en', {MAP_CONTROLS: {
      PIXEL: 'Toggle pixel info', CANCEL_PIXEL: 'Cancel pixel info',
      SEARCH: 'Search', ZOOM_IN: 'Zoom in', SETTINGS: 'Settings',
    }});
    oTranslate.setTranslation('fr', {MAP_CONTROLS: {
      PIXEL: 'Activer les informations du pixel', CANCEL_PIXEL: 'Annuler les informations du pixel',
      SEARCH: 'Rechercher', ZOOM_IN: 'Zoom avant', SETTINGS: 'Paramètres',
    }});
    oTranslate.use('fr');
    oContainer = document.createElement('div');
    oContainer.innerHTML = `
      <div class="leaflet-control">
        <a title="Toggle Pixel Info"></a>
        <button title="Geocode"></button>
        <input placeholder="Search...">
        <a title="Settings" data-map-control-key="SETTINGS"></a>
      </div>`;
    document.body.appendChild(oContainer);
    stopLocalizing = localizeMapControls(oContainer, oTranslate);
  });

  afterEach(() => {
    stopLocalizing();
    oContainer.remove();
  });

  it('translates initial controls, accessible labels, and search placeholders', () => {
    expect(oContainer.querySelector('a')!.title).toBe('Activer les informations du pixel');
    expect(oContainer.querySelector('a')!.getAttribute('aria-label')).toBe('Activer les informations du pixel');
    expect(oContainer.querySelector('input')!.placeholder).toBe('Rechercher');
    expect(oContainer.querySelector('button')!.title).toBe('Rechercher');
    expect(oContainer.querySelectorAll('a')[1].title).toBe('Paramètres');
  });

  it('updates existing controls when the language changes', () => {
    oTranslate.use('en');
    expect(oContainer.querySelector('a')!.title).toBe('Toggle pixel info');
    expect(oContainer.querySelector('input')!.placeholder).toBe('Search');
    oTranslate.use('fr');
    expect(oContainer.querySelector('a')!.title).toBe('Activer les informations du pixel');
  });

  it('translates dynamically created controls and changed button states', async () => {
    const oButton = document.createElement('a');
    oButton.title = 'Zoom in';
    oContainer.querySelector('.leaflet-control')!.appendChild(oButton);
    oContainer.querySelector('a')!.title = 'Cancel Pixel Info';
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    expect(oButton.title).toBe('Zoom avant');
    expect(oContainer.querySelector('a')!.title).toBe('Annuler les informations du pixel');
  });

  it('stops updating controls when the map is disposed', () => {
    stopLocalizing();
    oTranslate.use('en');
    expect(oContainer.querySelector('a')!.title).toBe('Activer les informations du pixel');
  });
});
