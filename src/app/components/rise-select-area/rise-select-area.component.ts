import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {MapService} from "../../services/map.service";

import L from 'leaflet';
// declare const L: any;
import 'leaflet-draw'
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
import {RiseTimebarComponent} from "../rise-timebar/rise-timebar.component";
import {NgIf} from "@angular/common";
import {OtpDialogComponent} from "../../dialogs/otp-dialog/otp-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {LatLonDialogComponent} from "../../dialogs/lat-lon-dialog/lat-lon-dialog.component";

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

    const LatLngButton= L.Control.extend({
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
          console.log("here")
          // We open the Manual Boundig Box Dialog
          // let oDialog = oController.m_oDialog.open(ManualBoundingBoxComponent, {
          //   height: '420px',
          //   width: '600px'
          // })


          let oDialog = oController.m_oDialog.open(LatLonDialogComponent, {
            height: '420px',
            width: '600px'
          });
          // Once is closed...
          oDialog.afterClosed().subscribe(oResult => {
            console.log(oResult)
            // We need a valid result
            // if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResult) === false) {
            //
            //   // With all the values for lat and lon
            //   if (isNaN(oResult.north) || isNaN(oResult.south) || isNaN(oResult.east) || isNaN(oResult.west)) {
            //     return;
            //   }
            //   else {
            //     // Get the actual values
            //     let fNorth = parseFloat(oResult.north);
            //     let fSouth = parseFloat(oResult.south);
            //     let fEast = parseFloat(oResult.east);
            //     let fWest = parseFloat(oResult.west);
            //
            //     // Create the bounds array
            //     let aoBounds = [[fNorth, fWest], [fSouth, fEast]];
            //
            //     // And add the new rectangle layer to the map
            //     oController.addManualBboxLayer(oMap, aoBounds);
            //   }
            // }
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
    oMap.addControl(new LatLngButton());
  }
  onDrawCreated(oEvent) {
    this.m_oDrawnItems.clearLayers();
    this.m_oMapService.onDrawCreated(oEvent);

  }


}
