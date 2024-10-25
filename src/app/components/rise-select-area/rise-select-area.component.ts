// import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
//
// import {MapService} from "../../services/map.service";
//
// import {LeafletModule} from '@bluehalo/ngx-leaflet';
// import {LeafletDrawModule} from '@asymmetrik/ngx-leaflet-draw';
// import {RiseTimebarComponent} from "../rise-timebar/rise-timebar.component";
// import {NgIf} from "@angular/common";
// import {MatDialog} from "@angular/material/dialog";
// import {ManualBoundingBoxComponent} from "../../dialogs/manual-bounding-box-dialog/manual-bounding-box.component";
// import {RiseButtonComponent} from "../rise-button/rise-button.component";
// import {NotificationsDialogsService} from '../../services/notifications-dialogs.service';
// // import * as L from 'leaflet';
// declare const L: any;
//
// import 'leaflet-draw'
//
//
// @Component({
//   selector: 'rise-select-area',
//   standalone: true,
//   imports: [
//     LeafletDrawModule,
//     LeafletModule,
//     RiseTimebarComponent,
//     NgIf,
//     RiseButtonComponent,
//
//   ],
//   templateUrl: './rise-select-area.component.html',
//   styleUrl: './rise-select-area.component.css'
// })
// /**
//  * RISE Select Area User Control
//  */
// export class RiseSelectAreaComponent implements OnInit, AfterViewInit {
//
//
//   /**
//    * Map input as described by the User Interface
//    */
//   @Input() m_sMapTitle: string = "default";
//
//   /**
//    * Event about map changed
//    */
//   @Output() m_oMapInputChange = new EventEmitter;
//
//   m_oMap: L.Map;
//
//   m_oMapOptions: any;
//
//   m_oDrawnItems: any;
//
//   m_oDrawOptions: any;
//   m_bIsDrawCreated: boolean = false;
//   m_bIsAutoDrawCreated: boolean = false;
//   m_bIsImportDrawCreated: boolean = false;
//   m_oImportShapeMarker: L.Marker | null = null;
//   m_oDrawMarker: L.Marker | null = null;
//
//
//   constructor(private m_oDialog: MatDialog, private m_oMapService: MapService, private m_oNotificationService: NotificationsDialogsService) {
//     this.m_oMapOptions = this.m_oMapService.m_oOptions;
//     this.m_oDrawOptions = this.m_oMapService.m_oDrawOptions;
//     this.m_oDrawnItems = this.m_oMapService.m_oDrawnItems;
//     this.m_oDrawOptions.edit.featureGroup = this.m_oDrawnItems;
//   }
//
//   ngAfterViewInit(): void {
//   }
//
//   ngOnInit(): void {
//     // this.clearPreviousDrawings();
//   }
//
//   onMapReady(oMap) {
//     this.m_oMap = oMap;
//     this.m_oMapService.clearPreviousDrawings(oMap);
//     let southWest = L.latLng(0, 0);
//     let northEast = L.latLng(0, 0);
//
//     let oBoundaries = L.latLngBounds(southWest, northEast);
//
//     oMap.fitBounds(oBoundaries);
//     oMap.setZoom(3);
//     oMap.addLayer(this.m_oMapService.m_oOSMBasic);
//
//     this.m_oMapService.addMousePositionAndScale(oMap);
//     this.m_oMapService.m_oLayersControl.addTo(oMap);
//     this.m_oMapService.initGeoSearchPluginForOpenStreetMap(oMap);
//     this.addManualBbox(oMap);
//     this.addCircleButton(oMap);
//   }
//
//
//   //Go to position by inserting coords
//   addManualBbox(oMap: any) {
//     this.m_oMapService.addManualBbox(oMap)
//   }
//
//   //Confirm inserted area
//   confirmInsertedArea(oEvent?: any, fRadius?: number, fLat?: number, fLng?: number, geoJson?: any) {
//     let sMessage: string = "Please confirm your input"
//     this.m_oNotificationService.openConfirmationDialog(sMessage).subscribe(bDialogResult => {
//       if (bDialogResult) {
//         // Emit the appropriate area based on the shape creation method
//         if (this.m_bIsImportDrawCreated && geoJson) {
//           this.emitGeoJSONShapeInfo(geoJson);
//         } else if (this.m_bIsDrawCreated && oEvent) {
//           this.emitDrawnAreaEvent(oEvent);
//         } else if (this.m_bIsAutoDrawCreated && fRadius !== undefined && fLat !== undefined && fLng !== undefined) {
//           this.emitCircleButtonAreaEvent(fRadius, fLat, fLng);
//         }
//       } else {
//         // Clear the area
//         this.m_oMapService.clearPreviousDrawings(this.m_oMap);
//       }
//     });
//   }
//
//   // Different ways to draw an area
//   //Using leaflet drawings
//   onDrawCreated(oEvent) {
//     this.m_oMapService.onDrawCreated(oEvent, this.m_oMap);
//     this.confirmInsertedArea(oEvent);
//     this.emitDrawnAreaEvent(oEvent);
//   }
//
//   //Handle when the user want to choose a position and let rise draw the minimum area around that point
//
//   //todo add confirmation and emit
//   addCircleButton(oMap: any) {
//     this.m_oMapService.addCircleButton(oMap);
//   }
//
//   //Import shape file
//   //todo confirmation + emit
//   openImportDialog(): void {
//     this.m_oMapService.openImportDialog(this.m_oMap);
//   }
//
//   //Clearing previous drawing so to ensure only one area is emitted
//   clearPreviousDrawings() {
//     this.m_oMapService.clearPreviousDrawings(this.m_oMap);
//
//
//   }
//
//
//   // Function to calculate the centroid of a polygon
//   calculateCentroid(points: Array<{ lat: number, lng: number }>): { lat: number, lng: number } {
//     let latSum = 0;
//     let lngSum = 0;
//     const numPoints = points.length;
//
//     points.forEach(point => {
//       latSum += point.lat;
//       lngSum += point.lng;
//     });
//
//     // Return the average lat and lng to get the centroid
//     return {
//       lat: latSum / numPoints,
//       lng: lngSum / numPoints
//     };
//   }
//
//   //Emitting the area to the parent component
//   private emitDrawnAreaEvent(oEvent) {
//     let iSelectedArea = 0;
//     let oShapeInfo = {};
//
//     // Check if it's a circle
//     if (oEvent.layer instanceof L.Circle) {
//       const center = oEvent.layer.getLatLng();
//       const radius = oEvent.layer.getRadius();
//       iSelectedArea = Math.PI * Math.pow(radius, 2); // Calculate area of the circle
//
//       oShapeInfo = {
//         type: 'circle',
//         center: {
//           lat: center.lat,
//           lng: center.lng
//         },
//         radius: radius,
//         area: iSelectedArea
//       };
//       this.m_oDrawMarker = L.marker([center.lat, center.lng]).addTo(this.m_oMap);
//
//     }
//     // Check if it's a polygon (including rectangles)
//     else if (oEvent.layer instanceof L.Polygon) {
//       const latLngs = oEvent.layer.getLatLngs()[0]; // Get the array of points (vertices)
//
//       iSelectedArea = L.GeometryUtil.geodesicArea(latLngs); // Get the area of the polygon
//
//       // Collect all points (vertices) of the polygon
//       const points = latLngs.map((point: L.LatLng) => {
//         return {lat: point.lat, lng: point.lng};
//       });
//       // Calculate the centroid (center) of the polygon
//       const centroid = this.calculateCentroid(points);
//       oShapeInfo = {
//         type: 'polygon',
//         points: points,
//         area: iSelectedArea,
//         center: centroid,
//         geoJson: oEvent.layer.toGeoJSON().geometry
//       };
//       this.m_oDrawMarker = L.marker([centroid.lat, centroid.lng]).addTo(this.m_oMap);
//     }
//     // Emit the shape information (area, points, center, radius) to the parent component
//     this.m_oMapInputChange.emit(oShapeInfo);
//   }
//
//   private emitCircleButtonAreaEvent(fRadius: number, fLat, fLng) {
//     const fArea = Math.PI * fRadius * fRadius;
//
//     // Emit the circle info (center, radius, and area)
//     const oShapeInfo = {
//       type: 'circle',
//       center: {lat: fLat, lng: fLng},
//       radius: fRadius,
//       area: fArea // Add area to the emitted shape info
//     };
//     this.m_oMapInputChange.emit(oShapeInfo);
//   }
//
//   private emitGeoJSONShapeInfo(geoJson: any) {
//     let oShapeInfo = {};
//     let iSelectedArea = 0;
//
//     if (geoJson.geometry.type === "Polygon") {
//       // GeoJSON coordinates are in [lng, lat] format, need to convert to [lat, lng]
//       const latLngs = geoJson.geometry.coordinates[0].map((point: [number, number]) => {
//         return L.latLng(point[1], point[0]); // Convert [lng, lat] to [lat, lng]
//       });
//
//       // Calculate the area of the polygon using Leaflet GeometryUtil
//
//       iSelectedArea = L.GeometryUtil.geodesicArea(latLngs);
//
//       // Prepare the points data
//       const points = latLngs.map((point: L.LatLng) => {
//         return {lat: point.lat, lng: point.lng};
//       });
//       // Calculate the centroid (center) of the polygon
//       const centroid = this.calculateCentroid(points);
//       oShapeInfo = {
//         type: 'polygon',
//         points: points,
//         area: iSelectedArea,
//         center: centroid,
//         geoJson: geoJson
//       };
//       this.m_oImportShapeMarker = L.marker([centroid.lat, centroid.lng]).addTo(this.m_oMap);
//
//     } else if (geoJson.type === "circle") {
//       //todo will have to test with file to verify
//     }
//
//     // Emit the shape information to the parent component
//     this.m_oMapInputChange.emit(oShapeInfo);
//   }
//
//
// }
