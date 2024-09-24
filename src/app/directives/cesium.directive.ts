import { AfterViewInit, Directive, ElementRef, ViewRef } from '@angular/core';
import { CesiumService } from '../services/cesium.service';

@Directive({
  selector: '[appCesium]',
  standalone: true
})
export class CesiumDirective implements AfterViewInit {
  m_oViewer: ViewRef | null = null;
  constructor(private m_oCesiumService: CesiumService, private m_oElementRef: ElementRef) { }

  ngAfterViewInit(): void {
    this.m_oViewer = this.m_oCesiumService.createCesiumViewer(this.m_oElementRef);
  }
}
