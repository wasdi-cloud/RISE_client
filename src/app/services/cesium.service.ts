import { ElementRef, Injectable, ViewRef } from '@angular/core';
import { environment } from '../../environments/environments';

declare var Cesium: any;

@Injectable({
  providedIn: 'root'
})
export class CesiumService {
  m_oCesiumViewer: ViewRef | null = null;
  m_bFirstCall: boolean = true;

  m_oWasdiGlobe: any;

  m_aoLayers

  m_sCesiumAccessToken: string = environment.cesiumToken;

  m_sArcGisAccessToken: string = environment.esriToken;


  constructor() { }

  public createCesiumViewer(oElement: ElementRef): ViewRef | null {
    if (this.m_bFirstCall === true) {
      this.m_bFirstCall = false;
      Cesium.ArcGisMapService.defaultAccessToken = this.m_sArcGisAccessToken;
      Cesium.Ion.defaultAccessToken = this.m_sCesiumAccessToken;

      const arcGisImagery = Cesium.ArcGisMapServerImageryProvider.fromBasemapType(Cesium.ArcGisBaseMapType.SATELLITE);

      let oGlobeInstance = new Cesium.Viewer(oElement.nativeElement,
        {
          onlySunLighting: true,
          timeline: false,
          animation: false,
          infoBox: false,
          fullscreenButton: false,
          baseLayerPicker: true,
          geocoder: false,
          homeButton: false,
          navigationHelpButton: false,
          navigationInstructionsInitiallyVisible: false,
          imageryProvider: false,
          scene3DOnly: true,
          // baseLayer: 
        });
      oGlobeInstance.scene.globe.baseColor = Cesium.Color.BLACK;

      oGlobeInstance.scene.light = new Cesium.DirectionalLight({
        direction: new Cesium.Cartesian3(0, 0, 0)
      });

      // Select OpenLayers and Cesium DEM Terrain by default
      oGlobeInstance.baseLayerPicker.viewModel.selectedImagery = oGlobeInstance.baseLayerPicker.viewModel.imageryProviderViewModels[14];
      oGlobeInstance.baseLayerPicker.viewModel.selectedTerrain = oGlobeInstance.baseLayerPicker.viewModel.terrainProviderViewModels[1];

      this.m_aoLayers = oGlobeInstance.imageryLayers;

      this.m_oWasdiGlobe = oGlobeInstance;
      return oGlobeInstance;

    } else {
      return null;
    }
  }

  /**
   * Clear the globe to free the resources
   */
  clearGlobe() {
    if (this.m_oWasdiGlobe) {
      // this.removeAllEntities();

      this.m_oWasdiGlobe.destroy();
      this.m_oWasdiGlobe = null;
      this.m_aoLayers = null;
    }
    else {
      this.m_aoLayers = null;
    }
  }

  /**
   * Get a reference to the globe
   * @returns Globe Object
   */
  getGlobe() {
    return this.m_oWasdiGlobe;
  }
}
