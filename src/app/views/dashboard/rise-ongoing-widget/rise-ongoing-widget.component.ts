import {Component, NgZone, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {EventViewModel} from '../../../models/EventViewModel';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {RiseBadgeComponent} from '../../../components/rise-badge/rise-badge.component';
import {EventType} from "../../../models/EventType";
import { EventService } from '../../../services/api/event.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'rise-ongoing-widget',
  standalone: true,
  imports: [CommonModule, TranslateModule, RiseBadgeComponent, MatTooltipModule],
  templateUrl: './rise-ongoing-widget.component.html',
  styleUrl: './rise-ongoing-widget.component.css',
})
export class RiseOngoingWidgetComponent implements OnInit {
  @Input() m_aoOngoingEvent: Array<EventViewModel> = [];

  constructor(
    private m_oEventService: EventService,
    private m_oRouter: Router,
    private m_oNgZone: NgZone,    
  ) 
  {

  }  

  testEvent: EventViewModel = {
    name: 'Madagascar',
    id: '',
    startDate: Date.now(),
    endDate: 0,
    type: EventType.FLOOD,
    bbox: '',
    peakDate: 0,
    description:""
  };

  m_bShowContent: boolean = true;

  ngOnInit(): void {
    this.m_oEventService.getOngoing().subscribe((oResponse) => {
      if (oResponse) {
        this.m_aoOngoingEvent = oResponse;
      } else {
        this.m_aoOngoingEvent = [];
      }
    });
  }

  collapseWidget() {
    this.m_bShowContent = !this.m_bShowContent;
  }

    openTargetArea(sAreaId: string) {
    if (sAreaId) {
      this.m_oNgZone.run(() => this.m_oRouter.navigateByUrl(`monitor/${sAreaId}`));
    }
  }  
}
