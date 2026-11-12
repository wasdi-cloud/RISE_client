import {TranslateService} from '@ngx-translate/core';

const CONTROL_KEYS: Readonly<Record<string, string>> = {
  'Start Measurement': 'MEASURE',
  'Draw Polyline': 'DRAW_LINE',
  'Draw Polygon': 'DRAW_POLYGON',
  'Draw Circle': 'DRAW_CIRCLE',
  'Draw Rectangle': 'DRAW_RECTANGLE',
  'Cancel': 'CANCEL',
  'Import Shape File': 'IMPORT',
  'Manual Bounding Box': 'BOUNDING_BOX',
  'Search by Coordinates': 'COORDINATES',
  'Cancel Pixel Info': 'CANCEL_PIXEL',
  'Toggle Pixel Info': 'PIXEL',
  'Print Map View': 'PRINT',
  'Automatically Insert a Circle': 'AUTO_CIRCLE',
  'Layer Analyzer': 'ANALYZER',
  'Zoom in': 'ZOOM_IN',
  'Zoom out': 'ZOOM_OUT',
  'Layers': 'BASEMAPS',
  'Geocode': 'SEARCH',
  'Search...': 'SEARCH',
  'Full Screen': 'FULLSCREEN',
  'Exit Full Screen': 'EXIT_FULLSCREEN',
  'Edit layers': 'EDIT',
  'Delete layers': 'DELETE',
  'No layers to edit': 'NO_EDIT',
  'No layers to delete': 'NO_DELETE',
  'Draw a polyline': 'DRAW_LINE',
  'Draw a polygon': 'DRAW_POLYGON',
  'Draw a rectangle': 'DRAW_RECTANGLE',
  'Draw a circle': 'DRAW_CIRCLE',
};

export function localizeMapControls(oContainer: HTMLElement, oTranslate: TranslateService): () => void {
  const oKeys = new WeakMap<Element, string>();
  let oLabels: Record<string, string> = {};

  const update = () => {
    oContainer.querySelectorAll<HTMLElement>('.leaflet-control[title], .leaflet-control [title], .leaflet-control input[placeholder]')
      .forEach(oElement => {
        const sAttribute = oElement instanceof HTMLInputElement ? 'placeholder' : 'title';
        const sKey = oElement.dataset['mapControlKey'] ??
          CONTROL_KEYS[oElement.getAttribute(sAttribute) ?? ''] ?? oKeys.get(oElement);
        if (!sKey) {
          return;
        }
        oKeys.set(oElement, sKey);
        const sLabel = oLabels[sKey];
        if (sLabel && oElement.getAttribute(sAttribute) !== sLabel) {
          oElement.setAttribute(sAttribute, sLabel);
        }
        if (sLabel && sAttribute === 'title' && oElement.matches('a, button') &&
          oElement.getAttribute('aria-label') !== sLabel) {
          oElement.setAttribute('aria-label', sLabel);
        }
      });
  };

  const oSubscription = oTranslate.stream('MAP_CONTROLS').subscribe((oTranslations: Record<string, string>) => {
    oLabels = oTranslations;
    update();
  });
  // Leaflet creates and replaces controls outside Angular, including measurement submenus.
  const oObserver = new MutationObserver(update);
  oObserver.observe(oContainer, {childList: true, subtree: true, attributes: true, attributeFilter: ['title', 'placeholder']});
  return () => {
    oObserver.disconnect();
    oSubscription.unsubscribe();
  };
}
