import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MapService } from '../../services/map.service';
import { Map } from 'leaflet';
// declare const L: any;
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { RiseTimebarComponent } from '../rise-timebar/rise-timebar.component';
@Component({
  selector: 'rise-map',
  standalone: true,
  imports: [CommonModule, RiseTimebarComponent],
  templateUrl: './rise-map.component.html',
  styleUrl: './rise-map.component.css'
})
export class RiseMapComponent implements OnInit, AfterViewInit {
  private m_oMap: L.Map;

  constructor(private m_oMapService: MapService) { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.m_oMapService.initWasdiMap('map');
  }
}
