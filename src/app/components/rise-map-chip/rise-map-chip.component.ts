import { Component, Input, OnInit } from '@angular/core';
import {NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'rise-map-chip',
  standalone: true,
  imports: [NgIf, NgClass],
  templateUrl: './rise-map-chip.component.html',
  styleUrl: './rise-map-chip.component.css',
})
export class RiseMapChipComponent implements OnInit {
  @Input() m_sTitle: string = '';
  @Input() m_sTooltip: string = '';
  @Input() m_bIsActive: boolean = false;
  @Input() m_sIcon: string = '';
  @Input() m_sChipType: 'default' | 'toggle' = 'default';
  @Input() m_bDisabled: boolean=false;


  ngOnInit() {
    this.applyIcon();
  }

  /**
   * Search the plugin name for the appropriate icon
   */
  applyIcon() {
    let sIcon = this.m_sIcon.toLowerCase();
    if (sIcon.includes('flood')) {
      this.m_sIcon = 'flood';
    } else if (sIcon.includes('drought')) {
      this.m_sIcon = 'light_mode';
    } else if (sIcon.includes('building')) {
      this.m_sIcon = 'domain';
    }else if (sIcon.includes('rain')) {
      this.m_sIcon = 'rainy';
    }else if (sIcon.includes('impact')) {
      this.m_sIcon = 'destruction';
    }else if (sIcon.includes('more')) {
      this.m_sIcon = 'chevron_right';
    }else if (sIcon.includes('less')) {
      this.m_sIcon = 'chevron_left';
    }else if (sIcon.includes('active_fire')) {
      this.m_sIcon = 'mode_heat';
    } else {
      this.m_sIcon = 'layers';
    }
  }
}
