import { CommonModule } from '@angular/common';
import { Component, NgZone, Input, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { WidgetService } from '../../../services/api/widget.service';
import { WidgetInfoViewModel } from '../../../models/WidgetInfoViewModel';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'rise-affected-widget',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatTooltipModule],
  templateUrl: './rise-affected-widget.component.html',
  styleUrl: './rise-affected-widget.component.css'
})
export class RiseAffectedWidgetComponent implements OnInit {
  m_bShowContent: boolean = true
  @Input() m_iAffectedPpl: number = 0;

  m_oWidgetInfo: WidgetInfoViewModel = null;
  m_sAreaName: string = "";;

  constructor(
    private m_oWidgetService: WidgetService,
    private m_oRouter: Router,
    private m_oNgZone: NgZone,    
  ) 
  {

  }

  ngOnInit() {
    
    this.m_oWidgetService.getWidget("population", 0).subscribe((oResponse) => {
      if (oResponse) {

        const iParsedValue: number = parseInt(oResponse.content, 10);

        if (!isNaN(iParsedValue)) {
          this.m_iAffectedPpl = iParsedValue;
        } else {
          // Default value if parsing fails
          this.m_iAffectedPpl = 0; 
        }

        this.m_oWidgetInfo = oResponse;
        this.m_sAreaName = oResponse.areaName;
      }
      else {
        this.m_iAffectedPpl = 0; 
        this.m_oWidgetInfo = null;
      }
    });
  }

  collapseWidget() {
    this.m_bShowContent = !this.m_bShowContent;
  }

  openTargetArea() {
    if (this.m_oWidgetInfo) {
      this.m_oNgZone.run(() => this.m_oRouter.navigateByUrl(`monitor/${this.m_oWidgetInfo.areaId}`));
    }
    
  }
}
