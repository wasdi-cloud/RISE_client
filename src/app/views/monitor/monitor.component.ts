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

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [CommonModule, RiseButtonComponent, RiseMapComponent, RiseToolbarComponent, RiseGlobeComponent, RiseTimebarComponent, RiseLayerItemComponent, TranslateModule],
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.css'
})
export class MonitorComponent implements OnInit {
  m_bShow2D: boolean = true;

  m_oAreaOfOperation: any = null;

  m_aoLayers: Array<any> = [1, 2, 3, 4];

  m_aoButtons = LayerTypes;

  constructor() { }

  ngOnInit(): void { }

  /**
   * TODO: Get the layers for the selected type from the button execution
   * @param sLayerType 
   */
  getLayers(sLayerType: string) { }

  /**
   * TODO: Handle Changes to the Reference Time from the Timebar Component
   */
  getReferenceTime() { }

  /**
   * TODO: either open dialog to add event 
   */
  addNewGeolocalizedEvent() { }

  /**
   * TODO: Add a layer to the map
   */
  addLayerToMap(oLayer) { }

  /**
   * TODO: Open Cross-section tool
   */
  openCrossSectionTool() { }
}
