import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapService } from '../../services/map.service';
import { RiseTimebarComponent } from '../rise-timebar/rise-timebar.component';

import L from 'leaflet';
import 'leaflet-draw';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
import { AreaViewModel } from '../../models/AreaViewModel';

@Component({
  selector: 'rise-map',
  standalone: true,
  imports: [
    CommonModule,
    RiseTimebarComponent,
    LeafletModule,
    LeafletDrawModule,
  ],
  templateUrl: './rise-map.component.html',
  styleUrl: './rise-map.component.css',
})
export class RiseMapComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() m_aoAreas: Array<AreaViewModel> = [];
  m_oMap: L.Map;

  m_oMapOptions: any;

  m_oDrawnItems: any;

  m_oDrawOptions: any;
  m_oActiveBaseLayer: any;
  m_aoDrawnItems: L.FeatureGroup;
  constructor(private m_oMapService: MapService) {
    this.m_oMapOptions = this.m_oMapService.m_oOptions;
    this.m_oDrawOptions = this.m_oMapService.m_oDrawOptions;
    this.m_oDrawnItems = this.m_oMapService.m_oDrawnItems;
    this.m_oDrawOptions.edit.featureGroup = this.m_oDrawnItems;
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    for (let oArea of this.m_aoAreas) {
      this.m_oMapService.addMarker(oArea, this.m_oMap);
    }
  }

  onMapReady(oMap) {
    this.m_oMap = oMap;
    this.m_oMapService.setMap(this.m_oMap);

    let southWest = L.latLng(0, 0);
    let northEast = L.latLng(0, 0);

    let oBoundaries = L.latLngBounds(southWest, northEast);

    oMap.fitBounds(oBoundaries);
    oMap.setZoom(3);
    oMap.addLayer(this.m_oMapService.m_oOSMBasic);

    this.m_oMapService.addMousePositionAndScale(oMap);
    this.m_oMapService.m_oLayersControl.addTo(oMap);
    this.m_oMapService.initGeoSearchPluginForOpenStreetMap(oMap);

    for (let oArea of this.m_aoAreas) {
      this.m_oMapService.addMarker(oArea, oMap);
    }
  }

  onDrawCreated(oEvent) {
    this.m_oDrawnItems.clearLayers();
    this.m_oMapService.onDrawCreated(oEvent);
  }
}
