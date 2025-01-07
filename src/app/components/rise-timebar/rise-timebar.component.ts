import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges,} from '@angular/core';
import FadeoutUtils from '../../shared/utilities/FadeoutUtils';
import {RiseChipMenuComponent} from '../rise-chip-menu/rise-chip-menu.component';
import {RiseButtonComponent} from "../rise-button/rise-button.component";
import {MatTooltip} from "@angular/material/tooltip";
const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
@Component({
  selector: 'rise-timebar',
  standalone: true,
  imports: [CommonModule, RiseChipMenuComponent, RiseButtonComponent, MatTooltip],
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
   * Event of live button pressed
   */
  @Output() m_bLiveButtonPressed = new EventEmitter<boolean>();
  /**
   * Event of live button pressed
   */
  @Output() m_sPlayButtonPressed = new EventEmitter<string>();

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
  m_sIconColor: string = 'red';
  m_bIsLive: boolean = true;
  aiTicks: { value: any }[] = [];

  constructor() {
  }

  ngOnInit(): void {
    this.initDates();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.initDates();
    this.generateYearTicks();
  }
  m_aoEvents = [
    { date: 'Sat Oct 05 2024', description: 'New Year' },
    { date: '"Thu Dec 12 2024"', description: 'Christmas' },
  ];

  getEventMarkerPosition(eventDate: string): string {
    console.log(this.m_asDates)
    const eventIndex = this.m_asDates.findIndex(
      (date) => new Date(date).getTime() === new Date(eventDate).getTime()
    );

    if (eventIndex === -1) {
      return '0%'; // Default to 0% if the event date isn't in the range
    }

    const percentage = (eventIndex / (this.m_asDates.length - 1)) * 100;
    return `${percentage}%`;
  }
  generateYearTicks() {
    //todo make zoom in from year to months to days
    //todo make zoom out from days to months to years

    // const iStartYear =2010
    const iStartDate = new Date(this.m_iStartDate * 1000);
    const iStartYear = iStartDate.getFullYear();
    const iStartMonth = iStartDate.getMonth();
    const iStartDay = iStartDate.getDay();

    const iEndDate = new Date(this.m_iEndDate * 1000);
    const iEndYear = iEndDate.getFullYear();
    const iEndMonth = iEndDate.getMonth();
    const iEndDay = iEndDate.getDay();

    //Depending on the difference we show months or days
    // if it is more than one year ,we show years
    if(iEndYear-iStartYear>1){
      for (let year = iStartYear; year <= iEndYear; year++) {
        this.aiTicks.push({ value: year });
      }
    }else{
      //same year
      if(iEndYear-iStartYear==0){
        if(iEndMonth-iStartMonth>1){
          for (let month = iStartMonth; month <= iEndMonth; month++) {
            this.aiTicks.push({ value: MONTHS[month] });
          }
        }else{
          for (let day = iStartDay; day <= iEndDay; day++) {
            this.aiTicks.push({ value: day });
          }
        }
      }
      //different  year
      else{
        if(Math.abs(iEndMonth-iStartMonth)>1){
          for (let month = iStartMonth; month < 12; month++) {
            this.aiTicks.push({ value:  MONTHS[month] });
          }
          for (let month = 0; month <= iEndMonth; month++) {
            this.aiTicks.push({ value:  MONTHS[month] });
          }
        }else{
          for (let day = iStartDay; day <= iEndDay; day++) {
            this.aiTicks.push({ value: day });
          }
        }
      }
    }

  }

  getTickPosition(index: number): string {
    const totalTicks = this.aiTicks.length;

    if (index === 0) {
      return `0%`; // Align the first tick to the start
    }
    if (index === totalTicks - 1) {
      return `100%`; // Align the last tick to the end
    }

    // For other ticks, calculate the percentage
    const percentage = (index / (totalTicks - 1)) * 100;
    return `${percentage}%`;
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
    // asDates.push(date1)
    // asDates.push(date2)
    while (date1 <= date2) {
      asDates.push(date1.toDateString());
      date1.setDate(date1.getDate() + 1);
    }
    // asDates.push(date2.toDateString());
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
      this.m_iSliderValue = this.m_asDates.indexOf(this.m_oSelectedDate);
    } else {
      this.m_oSelectedDate = oEvent;
      this.m_iSliderValue = this.m_asDates.indexOf(this.m_oSelectedDate);
    }
    this.m_bIsLive = this.m_oSelectedDate === this.m_asDates[this.m_asDates.length - 1];
    this.m_sSelectedDateTimestamp = new Date(this.m_oSelectedDate).valueOf();
    this.emitSelectedDate();
  }

  setDateToLive() {
    if (this.m_asDates) {
      this.m_oSelectedDate = this.m_asDates[this.m_asDates.length - 1];
      this.m_iSliderValue = this.m_asDates.length - 1;
      this.m_sSelectedDateTimestamp = new Date(this.m_oSelectedDate).valueOf();
      this.m_bIsLive = true;
      this.emitSelectedDate();
      this.onLiveButtonClick();
    }
  }

  onLiveButtonClick() {
    this.m_bLiveButtonPressed.emit(true);
  }

  onPlayButtonClick() {
    this.m_sPlayButtonPressed.emit(this.m_oSelectedDate);
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
  initRegisteredEvents(): void {
  }

  /**
   * TODO: Ability to zoom in and out of the timebar
   * UC: User can zoom in and out the time bar
   * @returns void
   */
  zoomToTime(): void {
  }

  addOneDayToDate() {
    if (this.m_oSelectedDate) {
      let oDate = new Date(this.m_oSelectedDate)
      oDate.setDate(oDate.getDate() + 1)
      this.m_oSelectedDate = oDate.toDateString();
      this.m_sSelectedDateTimestamp = new Date(this.m_oSelectedDate).valueOf();
      this.emitSelectedDate();
    }
  }

  minusOneDayFromDate() {
    if (this.m_oSelectedDate) {
      let oDate = new Date(this.m_oSelectedDate)
      oDate.setDate(oDate.getDate() - 1)
      this.m_oSelectedDate = oDate.toDateString();
      this.m_sSelectedDateTimestamp = new Date(this.m_oSelectedDate).valueOf();
      this.emitSelectedDate();
    }
  }
}
