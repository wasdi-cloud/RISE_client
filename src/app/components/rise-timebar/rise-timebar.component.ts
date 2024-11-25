import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import FadeoutUtils from '../../shared/utilities/FadeoutUtils';
import { RiseChipMenuComponent } from '../rise-chip-menu/rise-chip-menu.component';

@Component({
  selector: 'rise-timebar',
  standalone: true,
  imports: [CommonModule, RiseChipMenuComponent],
  templateUrl: './rise-timebar.component.html',
  styleUrl: './rise-timebar.component.css',
})
export class RiseTimebarComponent implements OnInit, OnChanges {
  @Input() m_iStartDate: any = null;
  @Input() m_iEndDate: any = null;
  @Input() m_iFrames: number = 5;
  @Output() m_sSelectedDate: EventEmitter<number> = new EventEmitter<number>(
    null
  );

  m_asDates = [];

  m_iShownFrame: number = 1;

  m_aoDates: Array<Date> = [];

  m_iSliderValue: number = 0;

  m_oSelectedDate: string = '';
  m_sSelectedDateTimestamp: number = null;

  constructor() {}

  ngOnInit(): void {
    this.initDates();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.initDates();
  }

  /**
   * Initialize array of dates for the archive based on inputted start and end date
   * UC: RISE shows a time bar starting from the first date where there is data available for this area of interest
   * @returns void
   */
  initDates(): void {
    if (
      FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_iStartDate) ||
      FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_iEndDate)
    ) {
      return;
    }
    let date1 = new Date(this.m_iStartDate * 1000);
    let date2 = new Date(this.m_iEndDate * 1000);
    let asDates = [];

    while (date1 <= date2) {
      asDates.push(date1.toDateString());
      date1.setDate(date1.getDate() + 1);
    }
    this.m_asDates = asDates;

    this.m_oSelectedDate = asDates[0];
    this.m_iSliderValue = 0;
  }

  // User clicks on the time bar

  // RISE shows on the time bar markers where there are registered events (both automatically detected or inserted by the user)
  // User can zoom in and out the time bar

  /**
   * Get the selected tick on the timebar and match it to the corresponding date in the dates array and find the timestamp
   * UC: User can click on a date in the time bar
   * @param oEvent
   * @returns void
   */
  dateSelected(oEvent): void {
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent.target)) {
      this.m_oSelectedDate = this.m_asDates[oEvent.target.value];
    } else {
      this.m_oSelectedDate = oEvent;
      this.m_iSliderValue = this.m_asDates.indexOf(this.m_oSelectedDate);
    }
    this.m_sSelectedDateTimestamp = new Date(this.m_oSelectedDate).valueOf();
  }
  setTimeframe() {}

  /**
   * Emit the selected date to the parent which will align the monitor page with new info
   * UC: RISE re-align all the maps and layers according to the selected date
   * @returns void
   */
  emitSelectedDate(): void {
    this.m_sSelectedDate.emit(this.m_sSelectedDateTimestamp);
  }
}
