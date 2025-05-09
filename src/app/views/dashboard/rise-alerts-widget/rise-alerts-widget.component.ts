import {CommonModule} from '@angular/common';
import {Component, NgZone, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import {WidgetService} from '../../../services/api/widget.service';
import {WidgetInfoViewModel} from '../../../models/WidgetInfoViewModel';

@Component({
  selector: 'rise-alerts-widget',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatTooltipModule],
  templateUrl: './rise-alerts-widget.component.html',
  styleUrl: './rise-alerts-widget.component.css',
})
export class RiseAlertsWidgetComponent implements OnInit {
  @Input() m_aoAlerts: Array<WidgetInfoViewModel> = [];
  m_sAreaName = "";

  constructor(
    private m_oWidgetService: WidgetService,
    private m_oRouter: Router,
    private m_oNgZone: NgZone,    
  ) 
  {

  }

  m_bShowContent: boolean = true;

  ngOnInit(): void {
    this.m_oWidgetService.getWidgetList("alerts", 0).subscribe((oResponse) => {
      if (oResponse) {
        this.m_aoAlerts = oResponse;

        if (this.m_aoAlerts.length > 0) {
          this.m_sAreaName = this.m_aoAlerts[0].areaName;
        }
        else {
          this.m_sAreaName = "";
        }
      } else {
        this.m_aoAlerts = [];
        this.m_sAreaName = "";
      }
    });
  }

  collapseWidget() {
    this.m_bShowContent = !this.m_bShowContent;
  }

  openTargetArea(oAlert) {
    if (oAlert) {
      this.m_oNgZone.run(() => this.m_oRouter.navigateByUrl(`monitor/${oAlert.areaId}`));
    }
  }  
}
