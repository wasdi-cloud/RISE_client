import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {MapService} from "../../services/map.service";

import L from 'leaflet';
// declare const L: any;
import 'leaflet-draw'
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
import {RiseTimebarComponent} from "../rise-timebar/rise-timebar.component";
import {NgIf} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {ManualBoundingBoxComponent} from "../../dialogs/manual-bounding-box-dialog/manual-bounding-box.component";

@Component({
  selector: 'rise-select-area',
  standalone: true,
  imports: [
    LeafletDrawModule,
    LeafletModule,
    RiseTimebarComponent,
    NgIf,

  ],
  templateUrl: './rise-select-area.component.html',
  styleUrl: './rise-select-area.component.css'
})
/**
 * RISE Select Area User Control
 */
export class RiseSelectAreaComponent  implements OnInit, AfterViewInit {

  /**
   * Map input as described by the User Interface
   */
  @Input() m_sMapTitle:string="default";

  /**
   * Event about map changed
   */
  @Output() m_oMapInputChange = new EventEmitter;

  m_oMap: L.Map;

  m_oMapOptions: any;

  m_oDrawnItems: any;

  m_oDrawOptions: any;
  m_oActiveBaseLayer: any;
  m_aoDrawnItems: L.FeatureGroup;

  constructor(private m_oDialog: MatDialog,private m_oMapService:MapService) {
    this.m_oMapOptions = this.m_oMapService.m_oOptions;
    this.m_oDrawOptions = this.m_oMapService.m_oDrawOptions;
    this.m_oDrawnItems = this.m_oMapService.m_oDrawnItems;
    this.m_oDrawOptions.edit.featureGroup = this.m_oDrawnItems;
  }
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
  }

  onMapReady(oMap) {
    this.m_oMap = oMap;
    let southWest = L.latLng(0, 0);
    let northEast = L.latLng(0, 0);

    let oBoundaries = L.latLngBounds(southWest, northEast);

    oMap.fitBounds(oBoundaries);
    oMap.setZoom(3);
    oMap.addLayer(this.m_oMapService.m_oOSMBasic);

    this.m_oMapService.addMousePositionAndScale(oMap);
    this.m_oMapService.m_oLayersControl.addTo(oMap);
    this.m_oMapService.initGeoSearchPluginForOpenStreetMap(oMap);
    this.addManualBbox(oMap);
  }
  addManualBbox(oMap: any) {

    let oController = this;

    const m_oManualBoxingButton= L.Control.extend({
      options: {
        position: "topright"
      },
      onAdd: function (oMap) {

        // Create the container for the dialog
        let oContainer = L.DomUtil.create("div", "leaflet-bar leaflet-control");
        // Create the button to add to leaflet
        let oButton = L.DomUtil.create('a', 'leaflet-control-button', oContainer);

        // Click stops on our button
        L.DomEvent.disableClickPropagation(oButton);

        // And here we decide what to do with our button

        L.DomEvent.on(oButton, 'click', function () {
          // We open the Manual Boundig Box Dialog
          let oDialog = oController.m_oDialog.open(ManualBoundingBoxComponent, {
            height: '420px',
            width: '600px'
          });
          // Once is closed...
          oDialog.afterClosed().subscribe(oResult => {
            if(oResult!=null){
              console.log(oResult)
              if(oResult.north ==null ||oResult.west ==null ||oResult.east ==null ||oResult.south ==null  ){
                return;
              }else{
                let fNorth = parseFloat(oResult.north);
                let fSouth = parseFloat(oResult.south);
                let fEast = parseFloat(oResult.east);
                let fWest = parseFloat(oResult.west);
                let aoBounds = [[fNorth, fWest], [fSouth, fEast]];
                // Calculate the center of the bounds (midpoint of North-South and West-East)
                let fCenterLat = (fNorth + fSouth) / 2;
                let fCenterLng = (fWest + fEast) / 2;

                // Move the map to the center of the bounds and set a zoom level
                oMap.setView([fCenterLat, fCenterLng], 13);
              }

            }
            console.log('closed');
          })
        });

        // This is the "icon" of the button added to Leaflet
        oButton.innerHTML = '<span class="material-symbols-outlined">pin_invoke</span>';

        oContainer.title = "Manual Bounding Box";

        return oContainer;
      },
      onRemove: function (map) { },
    })
    oMap.addControl(new m_oManualBoxingButton());
  }
  onDrawCreated(oEvent) {
    this.m_oDrawnItems.clearLayers();
    this.m_oMapService.onDrawCreated(oEvent);

  }


}
