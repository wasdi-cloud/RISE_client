import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {LayerViewModel} from '../../models/LayerViewModel';
import {MatTooltip} from '@angular/material/tooltip';
import {MapService} from "../../services/map.service";

@Component({
  selector: 'rise-layer-item',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltip],
  templateUrl: './rise-layer-item.component.html',
  styleUrl: './rise-layer-item.component.css',
})
export class RiseLayerItemComponent {


  @Input() m_oLayer: any;
  m_sIcon: string = 'flood';
  m_bShowLayer = true;
  m_iOpacity: number = 100;
  m_bShowExpanded: boolean = false;
  m_bShowLegend: boolean = false;
  m_oLegend: { visible: boolean; plugin: string; url: string };


  constructor(private m_oMapService: MapService) {

  }

  @Output() m_oLayerVisibility: EventEmitter<boolean> =
    new EventEmitter<boolean>(true);

  @Output() m_oLayerOpacity: EventEmitter<number> = new EventEmitter<number>(
    null
  );

  @Output() m_oEmitAction: EventEmitter<{
    layer: LayerViewModel;
    action: string;
  }> = new EventEmitter<{ layer: LayerViewModel; action: string }>(null);

  toggleExpandedContent() {
    this.m_bShowExpanded = !this.m_bShowExpanded;
  }

  emitVisibility() {
    this.m_bShowLayer ? (this.m_iOpacity = 100) : (this.m_iOpacity = 0);
    this.m_oLayerVisibility.emit(this.m_bShowLayer);
  }

  emitOpacity() {
    this.m_iOpacity==0?(this.m_bShowLayer=false):(this.m_bShowLayer=true)
    this.m_oLayerOpacity.emit(this.m_iOpacity);
  }

  emitAction(sAction) {
    let oEmitObject = {
      layer: this.m_oLayer,
      action: sAction
    }

    this.m_oEmitAction.emit(oEmitObject);
  }

  showLegend(oLayer) {
    if (this.m_bShowLegend) {
      this.toggleLegend(false)
    } else {
      let sLayerUrl = this.m_oMapService.getLegendUrl(oLayer);
      this.m_oLegend = {
        url: sLayerUrl,
        plugin: oLayer.mapId,
        visible: true,
      }

      this.toggleLegend(true);
    }

  }

  toggleLegend(bShowLegend: boolean) {
    this.m_bShowLegend = bShowLegend;
  }

}
