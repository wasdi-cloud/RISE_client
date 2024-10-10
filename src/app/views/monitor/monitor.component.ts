import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { RiseMapComponent } from '../../components/rise-map/rise-map.component';
import { RiseToolbarComponent } from '../../components/rise-toolbar/rise-toolbar.component';
import { RiseGlobeComponent } from '../../components/rise-globe/rise-globe.component';
import { RiseTimebarComponent } from '../../components/rise-timebar/rise-timebar.component';
import { RiseButtonComponent } from '../../components/rise-button/rise-button.component';
import { RiseLayerItemComponent } from '../../components/rise-layer-item/rise-layer-item.component';

import { LayerTypes } from './layer-types';
import { AreaService } from '../../services/api/area.service';
import { ConstantsService } from '../../services/constants.service';
import { AreaViewModel } from '../../models/AreaViewModel';
import { ActivatedRoute } from '@angular/router';
import { MapAPIService } from '../../services/api/map.service';
import { MapService } from '../../services/map.service';
import { LayerService } from '../../services/api/layer.service';

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [
    CommonModule,
    RiseButtonComponent,
    RiseMapComponent,
    RiseToolbarComponent,
    RiseGlobeComponent,
    RiseTimebarComponent,
    RiseLayerItemComponent,
    TranslateModule,
  ],
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.css',
})
export class MonitorComponent implements OnInit {
  m_bShow2D: boolean = true;

  m_oAreaOfOperation: AreaViewModel = null;

  m_sAreaId: string = null;

  m_aoLayers: Array<any> = [1, 2, 3, 4];

  m_aoButtons = LayerTypes;

  m_sStartDate: Date = null;
  m_sEndDate: Date = null;
  m_iTestDate: number = 172767150000;

  constructor(
    private m_oActivatedRoute: ActivatedRoute,
    private m_oAreaService: AreaService,
    private m_oConstantsService: ConstantsService,
    private m_oLayerService: LayerService,
    private m_oMapAPIService: MapAPIService,
    private m_oMapService: MapService
  ) {}

  ngOnInit(): void {
    this.getActiveAOI();
  }

  getActiveAOI() {
    //Check if the AOI is stored in the Constants Service
    if (this.m_oConstantsService.getActiveAOI()) {
      this.m_oAreaOfOperation = this.m_oConstantsService.getActiveAOI();
      console.log('here');
    } else if (this.m_oActivatedRoute.snapshot.params['aoiId']) {
      console.log('there');
      this.m_sAreaId = this.m_oActivatedRoute.snapshot.params['aoiId'];
      this.openAOI(this.m_sAreaId);
    } else {
    }
    //Check if the ID is stored in the URL snapshot

    //Re-direct if ID not present
  }

  openAOI(sAreaId: string) {
    this.m_oAreaService.getAreaById(sAreaId).subscribe({
      next: (oResponse) => {
        console.log(oResponse);
        if (oResponse) {
          this.getMapsByArea(oResponse.id, oResponse.startDate);
        }
      },
      error: (oError) => {
        console.log(oError);
      },
    });
  }

  getMapsByArea(sAreaId: string, iAreaDate) {
    this.m_oMapAPIService.byArea(sAreaId).subscribe({
      next: (oResponse) => {
        if (oResponse.length > 0) {
          oResponse.forEach((oMap) => {
            if (oMap.id === 'sar_flood')
              this.getLayers(oMap.id, sAreaId, iAreaDate);
          });
        }
      },
      error: (oError) => {
        console.log(oError);
      },
    });
  }
  /**
   * TODO: Get the layers for the selected type from the button execution
   * @param sLayerType
   */
  getLayers(sMapId: string, sAreaId: string, iDate: number) {
    this.m_oLayerService
      .findLayer(sMapId, sAreaId, this.m_iTestDate)
      .subscribe({
        next: (oResponse) => {
          if (oResponse) {
            console.log(oResponse);
            this.m_oMapService.addLayerMap2DByServer(
              oResponse.layerId,
              oResponse.geoserverUrl
            );
            // this.m_oMapService.zoomBandImageOnGeoserverBoundingBox(oResponse.geoserverBoundingBox);
          }
        },
        error: (oError) => {
          console.log(oError);
        },
      });
  }

  /**
   * TODO: Handle Changes to the Reference Time from the Timebar Component
   */
  getReferenceTime() {}

  /**
   * TODO: either open dialog to add event
   */
  addNewGeolocalizedEvent() {}

  /**
   * TODO: Add a layer to the map
   */
  addLayerToMap(oLayer) {}

  /**
   * TODO: Open Cross-section tool
   */
  openCrossSectionTool() {}
}
