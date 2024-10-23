import { Component, Input, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'rise-map-chip',
  standalone: true,
  imports: [NgIf],
  templateUrl: './rise-map-chip.component.html',
  styleUrl: './rise-map-chip.component.css',
})
export class RiseMapChipComponent implements OnInit {
  @Input() m_sTitle: string = '';
  @Input() m_bIsActive: boolean = false;
  m_sIcon: string = '';

  ngOnInit() {
    this.applyIcon();
  }

  /**
   * Search the plugin name for the appropriate icon
   */
  applyIcon() {
    let sTitle = this.m_sTitle.toLowerCase();
    if (sTitle.includes('flood')) {
      this.m_sIcon = 'flood';
    } else if (sTitle.includes('drought')) {
      this.m_sIcon = 'light_mode';
    } else if (sTitle.includes('building')) {
      this.m_sIcon = 'domain';
    } else {
      this.m_sIcon = 'layers';
    }
  }
}
