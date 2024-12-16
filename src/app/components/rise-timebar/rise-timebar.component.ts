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
  /**
   * UC_190 Browse Time
   */

  /**
   * Timebar start date
   */
  @Input() m_iStartDate: any = null;

  /**
   * Timebar end date
   */
  @Input() m_iEndDate: any = null;

  /**
   * Date selected by the user
   */
  @Output() m_sSelectedDate: EventEmitter<number> = new EventEmitter<number>(
    null
  );

  /**
   * Array of total dates to be displayed by the timebar
   */
  m_asDates = [];

  /**
   * Array of DATE OBJECTS
   */
  m_aoDates: Array<Date> = [];

  /**
   * Value that the slider currently sits at
   */
  m_iSliderValue: number = 0;

  /**
   * Selected day corresponding to index of the slider value in Dates arrays - i.e., m_oSelectedDate = m_aoDates[m_iSliderValue]
   */
  m_oSelectedDate: string = '';

  /**
   * Timestamp corresponding to the selected date
   */
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

    this.m_oSelectedDate = asDates[asDates.length - 1];
    this.m_iSliderValue = asDates.length - 1;
  }

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
    this.emitSelectedDate();
  }

  /**
   * Emit the selected date to the parent which will align the monitor page with new info
   * UC: RISE re-align all the maps and layers according to the selected date
   * @returns void
   */
  emitSelectedDate(): void {
    this.m_sSelectedDate.emit(this.m_sSelectedDateTimestamp);
  }

  /**
   * TODO: Initialize the registered events on the timebar - make them clickable and associated to date/time
   * UC: RISE shows on the time bar markers where there are registered events (both automatically detected or inserted by the user)
   * @returns void
   */
  initRegisteredEvents(): void {}

  /**
   * TODO: Ability to zoom in and out of the timebar
   * UC: User can zoom in and out the time bar
   * @returns void
   */
  zoomToTime(): void {}

  addOneDayToDate() {
    if(this.m_oSelectedDate){
      let oDate=new Date(this.m_oSelectedDate)
      oDate.setDate(oDate.getDate()+1)
      this.m_oSelectedDate=oDate.toDateString();
      this.m_sSelectedDateTimestamp = new Date(this.m_oSelectedDate).valueOf();
      this.emitSelectedDate();
    }
  }
  minusOneDayFromDate() {
    if(this.m_oSelectedDate){
      let oDate=new Date(this.m_oSelectedDate)
      oDate.setDate(oDate.getDate()-1)
      this.m_oSelectedDate=oDate.toDateString();
      this.m_sSelectedDateTimestamp = new Date(this.m_oSelectedDate).valueOf();
      this.emitSelectedDate();
    }
  }
}
