import {CommonModule} from '@angular/common';
import {
  Component, ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import FadeoutUtils from '../../shared/utilities/FadeoutUtils';
import {RiseChipMenuComponent} from '../rise-chip-menu/rise-chip-menu.component';
import {RiseButtonComponent} from "../rise-button/rise-button.component";
import {MatTooltip} from "@angular/material/tooltip";
import {RiseCalendarComponent} from "../rise-calendar/rise-calendar.component";
import moment from "moment";
import {EventViewModel} from "../../models/EventViewModel";
import {DomEvent} from "leaflet";
import getMousePosition = DomEvent.getMousePosition;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

@Component({
  selector: 'rise-timebar',
  standalone: true,
  imports: [CommonModule, RiseChipMenuComponent, RiseButtonComponent, MatTooltip, RiseCalendarComponent],
  templateUrl: './rise-timebar.component.html',
  styleUrl: './rise-timebar.component.css',
})
export class RiseTimebarComponent implements OnInit, OnChanges {
  /**
   * UC_190 Browse Time
   */
  /**
   * element ref for the slider
   */
  @ViewChild('slider', { static: true }) slider!: ElementRef<HTMLInputElement>;
  /**
   * Timebar start date
   */
  @Input() m_iStartDate: number = null;

  /**
   * Timebar end date
   */
  @Input() m_iEndDate: number = null;

  /**
   * Date selected by the user
   */
  @Output() m_oSelectedDateEmitter: EventEmitter<number> = new EventEmitter<number>(
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
  m_sSelectedDate: string = '';

  /**
   * Timestamp corresponding to the selected date
   */
  m_sSelectedDateTimestamp: number = null;
  /**
   * Start date in moment type for the rise calendar
   */
  m_oMomentStartDate: moment.Moment = null;
  /**
   * Selected Date as Date format
   */
  m_oSelectedDate: Date;
  /**
   * Live Button icon
   */
  m_sLiveIconColor: string = 'red';
  /**
   * Live flag
   */
  m_bIsLive: boolean = true;
  /**
   * Ticks for the timebar
   */
  aiTicks: { value: any }[] = [];
  /**
   * Events to mark in the timebar
   */
  @Input() m_aoEvents:EventViewModel[] = [];

  m_iZoomLevel:number=0;
  m_iMaxZoomLevel:number=2;

  constructor() {
  }

  ngOnInit(): void {

    this.initDates();
    this.generateYearTicks();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.initDates();
    this.generateYearTicks();
  }


  /**
   * detect the wheel movement on the slider
   * @param event
   */
  @HostListener('wheel', ['$event'])
  onMouseWheel(event: WheelEvent) {
    if (this.isMouseOverSlider(event)) {
      let oDate=this.getMousePositionDate(event);
      console.log(oDate)
      if (event.deltaY < 0) {
        this.handleZoomingIn(oDate);
      } else {
        this.handleZoomingOut(oDate);
      }
      event.preventDefault(); // Prevents page scrolling
    }
  }

  private isMouseOverSlider(event: WheelEvent): boolean {
    const sliderElement = this.slider.nativeElement;
    const rect = sliderElement.getBoundingClientRect();
    return (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    );
  }

  /**
   * Get Marker position to insert in its right position in the timebar
   */
  getEventMarkerPosition(eventDate: number): string {
    let sDate=new Date(eventDate).toDateString()
    const eventIndex = this.m_asDates.findIndex(
      (date) => date === sDate
    );
    if (eventIndex === -1) {
      return "" ; // Default to 0% if the event date isn't in the range
    }

    const percentage = (eventIndex / (this.m_asDates.length - 1)) * 100;
    return `${percentage}%`;
  }

  /**
   * Based on difference between start date and  end date , generate the ticks for the timebar
   */
  generateYearTicks() {
    //this is for alpha only

    // this.m_iStartDate=this.m_iStartDate==-1?1420130166:this.m_iStartDate
    this.m_iStartDate=1420130166
    // const iStartYear =2015
    const iStartDate = new Date(this.m_iStartDate * 1000);
    const iStartYear = iStartDate.getFullYear();
    const iStartMonth = iStartDate.getMonth();
    const iStartDay = iStartDate.getDate();

    const iEndDate = new Date(this.m_iEndDate * 1000);
    const iEndYear = iEndDate.getFullYear();
    const iEndMonth = iEndDate.getMonth();
    const iEndDay = iEndDate.getDate();
    const iYearRange = iEndYear - iStartYear;
    this.aiTicks=[];
    // If the range is more than one year
    if (iYearRange > 1) {
      let interval = 1; // Default interval: one tick per year

      // Adjust interval based on range
      if (iYearRange > 50) {
        interval = 10; // One tick every 10 years for ranges over 50 years
      } else if (iYearRange > 20) {
        interval = 5; // One tick every 5 years for ranges over 20 years
      } else if (iYearRange > 10) {
        interval = 2; // One tick every 2 years for ranges over 10 years
      }

      for (let year = iStartYear; year <= iEndYear; year += interval) {
        this.aiTicks.push({ value: year });
      }
      this.m_iZoomLevel=0;// can go from year to month , and from month to days
    }else {
      //same year
      if (iYearRange == 0) {
        if (iEndMonth - iStartMonth > 1) {
          for (let month = iStartMonth; month <= iEndMonth; month++) {
            this.aiTicks.push({value: MONTHS[month]});
          }
          this.m_iZoomLevel=1;// can go from month to days
        } else {
          for (let day = iStartDay; day <= iEndDay; day++) {
            this.aiTicks.push({value: day});
          }
          this.m_iZoomLevel=2; // can go from month to days

        }
      }
      //different  year
      else {
        if (Math.abs(iEndMonth - iStartMonth) > 1) {
          for (let month = iStartMonth; month < 12; month++) {
            this.aiTicks.push({value: MONTHS[month]});
          }
          for (let month = 0; month <= iEndMonth; month++) {
            this.aiTicks.push({value: MONTHS[month]});
          }
          this.m_iZoomLevel=1; // can go from month to days
        } else {
          for (let day = iStartDay; day <= iEndDay; day++) {
            this.aiTicks.push({value: day});
          }
          this.m_iZoomLevel=2;// cant zoom since its only days

        }
      }
    }

  }

  /**
   * Get Tick  position to insert in its right position in the timebar
   */
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
    this.m_oMomentStartDate = moment(this.m_iStartDate * 1000);
    let startDate = new Date(this.m_iStartDate * 1000);
    let endDate = new Date(this.m_iEndDate * 1000);
    let asDates = [];
    // asDates.push(startDate)
    // asDates.push(endDate)
    while (startDate <= endDate) {
      asDates.push(startDate.toDateString());
      startDate.setDate(startDate.getDate() + 1);
    }
    // asDates.push(endDate.toDateString());
    this.m_asDates = asDates;

    this.m_sSelectedDate = asDates[asDates.length - 1];
    this.m_iSliderValue = asDates.length - 1;
    this.m_oSelectedDate = endDate
  }

  /**
   * Get the selected tick on the timebar and match it to the corresponding date in the dates array and find the timestamp
   * UC: User can click on a date in the time bar
   * @param oEvent
   * @returns void
   */
  dateSelected(oEvent): void {

    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent.target)) {

      this.m_sSelectedDate = this.m_asDates[oEvent.target.value];
      this.m_iSliderValue = this.m_asDates.indexOf(this.m_sSelectedDate);
    } else {
      this.m_sSelectedDate = oEvent;
      this.m_iSliderValue = this.m_asDates.indexOf(this.m_sSelectedDate);
    }
    this.m_bIsLive = this.m_sSelectedDate === this.m_asDates[this.m_asDates.length - 1];
    this.m_sSelectedDateTimestamp = new Date(this.m_sSelectedDate).valueOf();
    this.m_oSelectedDate = new Date(this.m_sSelectedDate);
    this.emitSelectedDate();
  }

  /**
   * Set Date to Live date
   */
  onLiveButtonClick() {
    if (this.m_asDates) {
      this.m_sSelectedDate = this.m_asDates[this.m_asDates.length - 1];
      this.m_iSliderValue = this.m_asDates.length - 1;
      this.m_sSelectedDateTimestamp = new Date(this.m_sSelectedDate).valueOf();
      this.m_oSelectedDate = new Date(this.m_sSelectedDate);
      this.m_bIsLive = true;
      this.emitSelectedDate();
      this.emitLiveButtonAction();
    }
  }

  /**
   * handle live button click
   */
  emitLiveButtonAction() {
    this.m_bLiveButtonPressed.emit(true);
  }

  /**
   * Handle play click
   */
  onPlayButtonClick() {
    this.m_sPlayButtonPressed.emit(this.m_sSelectedDate);
  }

  /**
   * Emit the selected date to the parent which will align the monitor page with new info
   * UC: RISE re-align all the maps and layers according to the selected date
   * @returns void
   */
  emitSelectedDate(): void {
    this.m_oSelectedDateEmitter.emit(this.m_sSelectedDateTimestamp);
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

  /**
   * add One day to the timebar / time
   *
   */
  addOneDayToDate() {
    if (this.m_sSelectedDate) {
      let oDate = new Date(this.m_sSelectedDate)
      oDate.setDate(oDate.getDate() + 1)
      this.m_sSelectedDate = oDate.toDateString();
      this.m_sSelectedDateTimestamp = new Date(this.m_sSelectedDate).valueOf();
      this.m_oSelectedDate = new Date(this.m_sSelectedDate);
      this.emitSelectedDate();
    }
  }

  /**
   * Minus One day to the timebar / time
   *
   */
  minusOneDayFromDate() {
    if (this.m_sSelectedDate) {
      let oDate = new Date(this.m_sSelectedDate)
      oDate.setDate(oDate.getDate() - 1)
      this.m_sSelectedDate = oDate.toDateString();
      this.m_sSelectedDateTimestamp = new Date(this.m_sSelectedDate).valueOf();
      this.m_oSelectedDate = new Date(this.m_sSelectedDate);
      this.emitSelectedDate();
    }
  }

  convertEventToDates() {
    if(this.m_aoEvents){
      let oReturnList:Date[]=[];
      for (let i = 0; i <this.m_aoEvents.length ; i++) {
        oReturnList.push(new Date(this.m_aoEvents[i].peakDate));
      }
      return oReturnList;
    }
    return [];
  }

  private getMousePositionDate(event:WheelEvent) {
    const slider = document.getElementById('slider-id') as HTMLInputElement;
    if (!slider) return;

    // Get the cursor position relative to the slider
    const rect = slider.getBoundingClientRect();
    const cursorPosition = event.clientX - rect.left;
    const sliderWidth = rect.width;

    // Convert position to a value within slider range
    const relativePosition = cursorPosition / sliderWidth;
    const index = Math.round(relativePosition * (this.m_asDates.length - 1));

    // Ensure index is within bounds
    const clampedIndex = Math.max(0, Math.min(this.m_asDates.length - 1, index));
    const selectedDate = this.m_asDates[clampedIndex];
    return selectedDate;
  }

  private handleZoomingIn(oDate: any) {
    if(this.m_iZoomLevel < this.m_iMaxZoomLevel){
      this.m_iZoomLevel++;
      if(this.m_iZoomLevel==1){
        //handle years to months
        this.generateMonthTicks(oDate);
      }else if(this.m_iZoomLevel==2){
        //handle months to days
        this.generateDayTicks(oDate)
      }
    }
  }
  generateDayTicks(oSelectedDate: string) {
    const oDate = new Date(oSelectedDate);
    const oSelectedYear = oDate.getFullYear();
    const oSelectedMonth = oDate.getMonth();
    const daysInMonth = new Date(oSelectedYear, oSelectedMonth + 1, 0).getDate();

    this.aiTicks = [];
    this.m_asDates = []; // Reset slider values

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${oSelectedYear}-${oSelectedMonth + 1}-${day}`;
      this.aiTicks.push({ value: `${day} ${MONTHS[oSelectedMonth]}` });
      this.m_asDates.push(dateString); // Update slider values
    }


    // Keep the selected date if possible
    const selectedDay = oDate.getDate();
    console.log('this is selected date : '+selectedDay)
    this.m_iSliderValue = selectedDay - 1; // Adjust index for zero-based array
    this.m_sSelectedDate = this.m_asDates[this.m_iSliderValue];

  }
  generateMonthTicks(oDate: string) {
    const dateObj = new Date(oDate);
    const selectedYear = dateObj.getFullYear();

    this.aiTicks = [];
    this.m_asDates = []; // Reset slider values

    for (let month = 0; month < 12; month++) {
      const dateString = `${selectedYear}-${month + 1}-01`;
      this.aiTicks.push({ value: MONTHS[month] }); // Display months as labels
      this.m_asDates.push(dateString); // Store full date string
    }


    // Keep the selected month if possible
    const selectedMonth = dateObj.getMonth();
    this.m_iSliderValue = selectedMonth; // Since months are zero-based
    this.m_sSelectedDate = this.m_asDates[this.m_iSliderValue];

  }


  private handleZoomingOut(oDate: any) {
    if(this.m_iZoomLevel >0){
      this.m_iZoomLevel--;
      if(this.m_iZoomLevel==0){
        //handle months to years
        this.initDates();
        this.generateYearTicks();
      }else if(this.m_iZoomLevel==1){
        //handle days to months

        this.generateMonthTicks(oDate);
      }
    }

  }


}
