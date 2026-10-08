import { Component, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';

import { RiseBadgeComponent } from '../../../components/rise-badge/rise-badge.component';
import { RiseButtonComponent } from '../../../components/rise-button/rise-button.component';
import { AreaViewModel } from '../../../models/AreaViewModel';

@Component({
  selector: 'rise-aoo-widget',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatTooltipModule,
    RiseBadgeComponent,
    RiseButtonComponent
  ],
  templateUrl: './rise-aoo-widget.component.html',
  styleUrl: './rise-aoo-widget.component.css'
})
export class RiseAooWidgetComponent {
  @Input() m_aoAreas: Array<AreaViewModel> = [];
  @Input() m_bShowPublicAoOs: boolean = true;
  @Output() m_oTogglePublic: EventEmitter<void> = new EventEmitter<void>();

  public m_bShowContent: boolean = true;

  // Default limit to keep the widget small without scrolling
  public m_iDefaultLimit: number = 4;
  public m_iDisplayLimit: number = this.m_iDefaultLimit;

  constructor(
    private m_oRouter: Router,
    private m_oNgZone: NgZone
  ) {}

  public collapseWidget(): void {
    this.m_bShowContent = !this.m_bShowContent;
  }

  public togglePublicAoOs(): void {
    this.m_oTogglePublic.emit();
  }

  public openMonitor(oArea: AreaViewModel): void {
    if (oArea && oArea.id) {
      this.m_oNgZone.run(() => this.m_oRouter.navigateByUrl(`monitor/${oArea.id}`));
    }
  }

  // Toggles between showing 4 items and showing all items
  public toggleShowAll(): void {
    if (this.m_iDisplayLimit === this.m_iDefaultLimit) {
      this.m_iDisplayLimit = this.m_aoAreas.length;
    } else {
      this.m_iDisplayLimit = this.m_iDefaultLimit;
    }
  }
}
