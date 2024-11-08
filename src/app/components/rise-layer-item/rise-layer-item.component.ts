import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RiseButtonComponent } from '../rise-button/rise-button.component';

@Component({
  selector: 'rise-layer-item',
  standalone: true,
  imports: [CommonModule, FormsModule, RiseButtonComponent],
  templateUrl: './rise-layer-item.component.html',
  styleUrl: './rise-layer-item.component.css',
})
export class RiseLayerItemComponent {
  @Input() m_oLayer: any;
  m_sIcon: string = 'flood';
  m_bShowLayer = true;
  m_iOpacity: number = 100;
  m_bShowExpanded: boolean = false;

  @Output() m_oLayerVisibility: EventEmitter<boolean> =
    new EventEmitter<boolean>(true);

  @Output() m_oLayerOpacity: EventEmitter<number> = new EventEmitter<number>(
    null
  );

  toggleExpandedContent() {
    this.m_bShowExpanded = !this.m_bShowExpanded;
  }

  emitVisibility() {
    this.m_bShowLayer ? (this.m_iOpacity = 100) : (this.m_iOpacity = 0);
    this.m_oLayerVisibility.emit(this.m_bShowLayer);
  }

  emitOpacity() {
    this.m_oLayerOpacity.emit(this.m_iOpacity);
  }
}
