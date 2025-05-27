import {CommonModule} from '@angular/common';
import {
  Component,
  ElementRef,
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
import {RiseButtonComponent} from "../rise-button/rise-button.component";
import {MatTooltip} from "@angular/material/tooltip";
import {RiseCalendarComponent} from "../rise-calendar/rise-calendar.component";
import moment from "moment";
import {EventViewModel} from "../../models/EventViewModel";
import {EventType} from "../../models/EventType";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

@Component({
  selector: 'rise-timebar',
  standalone: true,
  imports: [CommonModule, RiseButtonComponent, MatTooltip, RiseCalendarComponent],
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
  @ViewChild('slider', {static: true}) slider!: ElementRef<HTMLInputElement>;
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
  @Output() m_oSelectedDateEmitter: EventEmitter<any> = new EventEmitter<any>(null);

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
  m_aiTicks: { value: any , timestamp: number}[] = [];
  /**
   * Events to mark in the timebar
   */
  @Input() m_aoEvents: EventViewModel[] = [];

  @Input() m_iInitialSelectedDate: number = null;


  m_oZoomWindow: { start: number, end: number }; // in milliseconds


  m_iZoomLevel: number = 0;
  m_iMaxZoomInLevel: number = 2;
  m_iMaxZoomOutLevel: number = 0;
  m_sSliderClass: string = ''

  constructor() {
  }

  ngOnInit(): void {
    this.initDates(false);
    this.generateTicks();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['m_iEndDate'] && !changes['m_iEndDate'].firstChange) {
      this.initDates(false);
    }else{
      this.initDates(false);
      this.generateTicks();
    }
  }

  /**
   * detect the wheel movement on the slider
   * @param event
   */
  @HostListener('wheel', ['$event'])
  onMouseWheel(event: WheelEvent) {
    // ZOOM Disabled at the moment
    //
    // if (this.isMouseOverSlider(event)) {
    //   let oDate = this.getMousePositionDate(event);

    //   if (event.deltaY < 0) {
    //     this.handleZoomingIn(oDate);
    //   } else {
    //     this.handleZoomingOut(oDate);
    //   }
    //   event.preventDefault(); // Prevents page scrolling
    // }
  }

  getEventMarkerPosition(iEventTimestamp: number): string {
    // NOTE: this is for zoom but at the moment not working
    // const iRangeStart = this.m_oZoomWindow?.start || this.m_iStartDate * 1000;
    // const iRangeEnd = this.m_oZoomWindow?.end || this.m_iEndDate * 1000;
    const iRangeStart = this.m_iStartDate * 1000;
    const iRangeEnd = this.m_iEndDate * 1000;

    // Ensure the timestamp is within the range
    if (iEventTimestamp < iRangeStart || iEventTimestamp > iRangeEnd) {
      // Default to 0% if the event timestamp is out of range
      return "0%";
    }

    if (iRangeEnd==iRangeStart) {
      // Avoid division by zero
      return "0%";
    }

    const fPercent = (iEventTimestamp - iRangeStart) / (iRangeEnd - iRangeStart);
    return `${fPercent * 100}%`;
  }


  @HostListener('mouseenter', ['$event'])
  onMouseEnter() {
    this.updateSliderCursor();
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave() {
    this.m_sSliderClass = ''; // Reset cursor when leaving
  }

  updateSliderCursor() {
    if (this.m_iZoomLevel < 2) {
      this.m_sSliderClass = 'zoom-in';
    } else if (this.m_iZoomLevel > 0) {
      this.m_sSliderClass = 'zoom-out';
    } else {
      this.m_sSliderClass = '';
    }
  }

  /**
   * Based on difference between start date and  end date , generate the ticks for the timebar
   */
  generateTicks() {
    //this is for alpha only

    this.m_iStartDate = this.m_iStartDate == -1 ? 1420130166 : this.m_iStartDate
    // this.m_iStartDate=1420130166
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
    this.m_aiTicks = [];

    let iCurrentYear = new Date().getFullYear();
    let iCurrentMonth = new Date().getMonth();

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
      this.m_iZoomLevel = 0;// can go from year to month , and from month to days
      this.m_iMaxZoomOutLevel = 0;
      this.m_iMaxZoomInLevel = 2;
      this.generateYearTicks(iStartYear,iEndYear,interval);

    }
    else {
      //same year
      if (iYearRange == 0) {

        if (iEndMonth - iStartMonth >= 1) {

          for (let iMonth = iStartMonth; iMonth <= iEndMonth; iMonth++) {
            this.m_aiTicks.push({value: MONTHS[iMonth], timestamp: new Date(iCurrentYear, iMonth, 1).getTime()});
          }
          this.m_iZoomLevel = 1;// can go from month to days
          this.m_iMaxZoomInLevel = 2;
          this.m_iMaxZoomOutLevel = 1;

        }
        else {
          for (let iDay = iStartDay; iDay <= iEndDay; iDay++) {
            this.m_aiTicks.push({value: iDay, timestamp: new Date(iCurrentYear, iCurrentMonth, iDay).getTime()});
          }

          this.m_iZoomLevel = 2; // will be always days
          this.m_iMaxZoomInLevel = 2;
          this.m_iMaxZoomOutLevel = 2;
        }
      }
      //different  year
      else {
        if (Math.abs(iEndMonth - iStartMonth) >= 1) {
          for (let iMonth = iStartMonth; iMonth < 12; iMonth++) {
            this.m_aiTicks.push({value: MONTHS[iMonth], timestamp: new Date(iStartYear, iMonth, 1).getTime()});
          }
          for (let iMonth = 0; iMonth <= iEndMonth; iMonth++) {
            this.m_aiTicks.push({value: MONTHS[iMonth], timestamp: new Date(iEndYear, iMonth, 1).getTime()});
          }
          this.m_iZoomLevel = 1; // can go from month to days
          this.m_iMaxZoomInLevel = 2;
          this.m_iMaxZoomOutLevel = 1;
        }
        else {
          for (let iDay = iStartDay; iDay <= iEndDay; iDay++) {
            this.m_aiTicks.push({value: iDay, timestamp: new Date(iEndYear, iEndMonth, iDay).getTime()});
          }
          this.m_iZoomLevel = 2;// cant zoom since its only days
          this.m_iMaxZoomInLevel = 2;
          this.m_iMaxZoomOutLevel = 2;

        }
      }
    }
  }

  /**
   * Get Tick  position to insert in its right position in the timebar
   */
  getTickPosition2(iIndex: number): string {
    const iTotalTicks = this.m_aiTicks.length;

    if (iIndex === 0) {
      return `0%`; // Align the first tick to the start
    }
    if (iIndex === iTotalTicks - 1) {
      return `100%`; // Align the last tick to the end
    }

    // For other ticks, calculate the percentage
    const fPercentage = (iIndex / (iTotalTicks - 1)) * 100;
    return `${fPercentage}%`;
  }

  getTickPosition(iIndex: number): string {
    const oTick = this.m_aiTicks[iIndex];
    const iStartTimestamp = this.m_iStartDate * 1000;
    const iEndTimestamp = this.m_iEndDate * 1000;
    const iTotalDuration = iEndTimestamp - iStartTimestamp;

    if (!oTick.timestamp) return "0%"; // fallback if not initialized

    const iTickOffset = oTick.timestamp - iStartTimestamp;
    const fPercentage = (iTickOffset / iTotalDuration) * 100;

    return `${fPercentage}%`;
  }

  /**
   * Initialize array of dates for the archive based on inputted start and end date
   * UC: RISE shows a time bar starting from the first date where there is data available for this area of interest
   * @returns void
   */
  initDates(bChangedByUser:boolean): void {

    if (
      FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_iStartDate) ||
      FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_iEndDate)
    ) {
      return;
    }
    this.m_oMomentStartDate = moment(this.m_iStartDate * 1000);
    let oStartDate = new Date(this.m_iStartDate * 1000);
    let oEndDate = new Date(this.m_iEndDate * 1000);
    let asDates = [];

    while (oStartDate <= oEndDate) {
      asDates.push(oStartDate.toDateString());
      oStartDate.setDate(oStartDate.getDate() + 1);
    }

    // The end date is already included in the loop, so we don't need to add it again
    let sLastDayString = oEndDate.toDateString();

    // Safe check to ensure the last day is not already in the array
    if (!asDates.includes(sLastDayString)) {
      asDates.push(sLastDayString);
    }

    this.m_asDates = asDates;

    // 🔥 Pick initial selection based on input date
    if(this.m_iInitialSelectedDate && this.m_iInitialSelectedDate>=this.m_iStartDate && this.m_iInitialSelectedDate<=this.m_iEndDate  ){
      this.m_sSelectedDate = new Date(this.m_iInitialSelectedDate * 1000).toDateString()
      this.m_iSliderValue = this.m_asDates.indexOf(this.m_sSelectedDate);
      this.m_oSelectedDate = new Date(this.m_iInitialSelectedDate * 1000)
    }
    else {
      this.m_sSelectedDate =asDates[asDates.length - 1];
      this.m_iSliderValue = asDates.length - 1;
      this.m_oSelectedDate = oEndDate
    }

    this.m_bIsLive = this.m_sSelectedDate === this.m_asDates[this.m_asDates.length - 1];

    this.m_sSelectedDateTimestamp = this.m_oSelectedDate.valueOf();
    this.emitSelectedDate(null,bChangedByUser)
  }

  /**
   * Get the selected tick on the timebar and match it to the corresponding date in the dates array and find the timestamp
   * UC: User can click on a date in the time bar
   * @param oEvent
   * @param bChangedByUser
   * @param bIsHighlightedDate
   * @returns void
   */
  dateSelected(oEvent,bChangedByUser:boolean): void {

    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent.target)) {

      this.m_sSelectedDate = this.m_asDates[oEvent.target.value];
      this.m_iSliderValue = this.m_asDates.indexOf(this.m_sSelectedDate);
    }
    else {
      this.m_sSelectedDate = oEvent.date;
      this.m_iSliderValue = this.m_asDates.indexOf(this.m_sSelectedDate);
    }

    this.m_bIsLive = this.m_sSelectedDate === this.m_asDates[this.m_asDates.length - 1];
    // this.m_sSelectedDateTimestamp = new Date(this.m_sSelectedDate).valueOf();
    this.m_oSelectedDate = new Date(this.m_sSelectedDate);
    this.m_oSelectedDate.setHours(23, 59, 59, 0); // Set to 23:59:00
    this.m_sSelectedDateTimestamp = this.m_oSelectedDate.valueOf(); // Now based on the new time

    //console.log(this.m_oSelectedDate)
    //console.log(this.m_sSelectedDateTimestamp)

    this.emitLiveButtonAction();
    //this to capture when is the selected date from the calendar is an event date
    if(!FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent.isHighlighted) && oEvent.isHighlighted){
      //todo we need to find the event for this highlighted date
      console.log(this.m_oSelectedDate)
      console.log(this.m_aoEvents)
      for (let i = 0; i <this.m_aoEvents.length ; i++) {
        const oEventDate = new Date(this.m_aoEvents[i].peakDate * 1000);
        if (this.compareDatesByDay(oEventDate, this.m_oSelectedDate)) {
          this.emitSelectedDate(this.m_aoEvents[i].id,bChangedByUser)
          break;
        }
      }
      // let sEventId="";
      // this.emitSelectedDate(sEventId,bChangedByUser)
    }
    else if (FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent.target?.eventId)) {
      this.emitSelectedDate(null,bChangedByUser);
    }
    else {
      this.emitSelectedDate(oEvent.target.eventId,bChangedByUser);
    }
  }


  private compareDatesByDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
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
      this.m_iInitialSelectedDate = null;
      this.emitSelectedDate();
      this.emitLiveButtonAction();
    }
  }

  /**
   * handle live button click
   */
  emitLiveButtonAction() {
    this.m_bLiveButtonPressed.emit(this.m_bIsLive);
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
  emitSelectedDate(sEventId?: string,bChangedByUser?:boolean): void {
    //const oUtcDate = new Date(this.m_oSelectedDate.getTime() - this.m_oSelectedDate.getTimezoneOffset() * 60000);

    let oSelecteDateInfo = {
      iReferenceTime: this.m_oSelectedDate.getTime(),
      eventId: sEventId,
      bChangedByUser:bChangedByUser
    }

    this.m_oSelectedDateEmitter.emit(oSelecteDateInfo);

  }
  //todo make one function for add / minus day
  /**
   * add One day to the timebar / time
   *
   */
  addOneDayToDate() {
    const oSelectedDate = new Date(this.m_sSelectedDate);
    const oLastDate = new Date(this.m_asDates[this.m_asDates.length-1]);
    if (this.m_sSelectedDate && oSelectedDate<oLastDate) {
      oSelectedDate.setDate(oSelectedDate.getDate() + 1)
      this.m_sSelectedDate = oSelectedDate.toDateString();
      this.m_iSliderValue = this.m_asDates.indexOf(this.m_sSelectedDate);
      this.m_sSelectedDateTimestamp = oSelectedDate.valueOf();
      this.m_oSelectedDate = oSelectedDate;
      if(oSelectedDate.getTime()===oLastDate.getTime()){
        this.m_bIsLive=true;
        this.emitLiveButtonAction();
      }
      this.emitSelectedDate();
    }
  }

  /**
   * Minus One day to the timebar / time
   *
   */
  minusOneDayFromDate() {
    const oSelectedDate = new Date(this.m_sSelectedDate);
    const oFirstDate = new Date(this.m_asDates[0]);
    if (this.m_sSelectedDate && oSelectedDate > oFirstDate) {
      oSelectedDate.setDate(oSelectedDate.getDate() - 1);
      this.m_sSelectedDate = oSelectedDate.toDateString();
      this.m_iSliderValue = this.m_asDates.indexOf(this.m_sSelectedDate);
      this.m_sSelectedDateTimestamp = oSelectedDate.valueOf();
      this.m_oSelectedDate = oSelectedDate;
      this.m_bIsLive=false;
      this.emitLiveButtonAction();
      this.emitSelectedDate();
    }
  }


  convertEventToDates() {

    if (this.m_aoEvents) {
      let oReturnList: Date[] = [];
      for (let i = 0; i < this.m_aoEvents.length; i++) {

        oReturnList.push(new Date(this.m_aoEvents[i].peakDate*1000));
      }

      return oReturnList;
    }

    return [];
  }

  generateDayTicks(oSelectedDate: string) {
    const oDate = new Date(oSelectedDate);
    const oSelectedYear = oDate.getFullYear();
    const oSelectedMonth = oDate.getMonth();
    const iDayInMonth = new Date(oSelectedYear, oSelectedMonth + 1, 0).getDate();

    this.m_aiTicks = [];
    this.m_asDates = []; // Reset slider values

    for (let iDay = 1; iDay <= iDayInMonth; iDay++) {
      const sDateString = `${oSelectedYear}-${oSelectedMonth + 1}-${iDay}`;
      this.m_aiTicks.push({value: `${iDay} ${MONTHS[oSelectedMonth]}`, timestamp: new Date(oSelectedYear, oSelectedMonth, iDay).getTime()});
    }


    // Keep the selected date if possible
    const selectedDay = oDate.getDate();

    this.m_iSliderValue = selectedDay - 1; // Adjust index for zero-based array
    this.m_sSelectedDate = this.m_asDates[this.m_iSliderValue];

    // 👇 Zoom window for selected month
    this.m_oZoomWindow = {
      start: new Date(oSelectedYear, oSelectedMonth, 1).getTime(),
      end: new Date(oSelectedYear, oSelectedMonth + 1, 1).getTime(),
    };

  }

  generateMonthTicks(oDate: string) {
    const oDateObj = new Date(oDate);
    const iSelectedYear = oDateObj.getFullYear();

    this.m_aiTicks = [];
    this.m_asDates = []; // Reset slider values

    for (let iMonth = 0; iMonth < 12; iMonth++) {
      const sDateString = `${iSelectedYear}-${iMonth + 1}-01`;
      this.m_aiTicks.push({value: MONTHS[iMonth], timestamp: new Date(iSelectedYear, iMonth, 1).getTime() }); // Display months as labels
      this.m_asDates.push(sDateString); // Store full date string
    }


    // Keep the selected month if possible
    const iSelectedMonth = oDateObj.getMonth();
    this.m_iSliderValue = iSelectedMonth; // Since months are zero-based
    this.m_sSelectedDate = this.m_asDates[this.m_iSliderValue];
    this.m_oZoomWindow = {
      start: new Date(iSelectedYear, 0, 1).getTime(),
      end: new Date(iSelectedYear + 1, 0, 1).getTime(),
    };
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

  private getMousePositionDate(event: WheelEvent) {
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
    if (this.m_iZoomLevel < this.m_iMaxZoomInLevel) {
      this.m_iZoomLevel++;
      if (this.m_iZoomLevel == 1) {
        //handle years to months
        this.generateMonthTicks(oDate);
      } else if (this.m_iZoomLevel == 2) {
        //handle months to days
        this.generateDayTicks(oDate)
      }
      this.updateSliderCursor()
    }
  }

  private handleZoomingOut(oDate: any) {
    if (this.m_iZoomLevel > 0 && this.m_iZoomLevel>this.m_iMaxZoomOutLevel ) {
      this.m_iZoomLevel--;
      if (this.m_iZoomLevel == 0) {
        //handle months to years
        this.initDates(false);
        this.generateTicks();
      } else if (this.m_iZoomLevel == 1) {
        //handle days to months
        //check if we have initial state as months or years
        if(this.m_iMaxZoomOutLevel==1){
          this.initDates(false);
          this.generateTicks();
        }else{
          this.generateMonthTicks(oDate);
        }
      }
      this.updateSliderCursor()
    }

  }

  getVisibleEvents(): any[] {
    if (!this.m_oZoomWindow) return this.m_aoEvents;

    return this.m_aoEvents.filter(event => {
      const eventTime = event.peakDate * 1000;
      return eventTime >= this.m_oZoomWindow.start && eventTime < this.m_oZoomWindow.end;
    });
  }


  private generateYearTicks(iStartYear:number,iEndYear:number,interval:number) {
    for (let iYear = iStartYear; iYear <= iEndYear; iYear += interval) {
      this.m_aiTicks.push({value: iYear, timestamp: new Date(iYear, 0, 1).getTime()});
    }

    this.m_oZoomWindow = {
      start: new Date(iStartYear, 0, 1).getTime(),
      end: new Date(iEndYear + 1, 0, 1).getTime(), // exclusive end
    };
  }

  goToEvent(oEvent: any,bChangedByUser): void {
    const iEventTimestamp = oEvent.peakDate * 1000;

    // Check if the event is within the current zoom window
    // const bIsInWindow = this.m_oZoomWindow &&
    //   iEventTimestamp >= this.m_oZoomWindow.start &&
    //   iEventTimestamp < this.m_oZoomWindow.end;
    //
    // if (!bIsInWindow && this.m_iZoomLevel < this.m_iMaxZoomInLevel) {
    //   // Event is outside current view — zoom in around it
    //   const sEventDateString = new Date(iEventTimestamp).toISOString().split("T")[0];
    //   this.handleZoomingIn(sEventDateString); // will regenerate m_asDates
    // }

    // Find the closest matching date string (since m_asDates is string-based)
    const oEventDate = new Date(iEventTimestamp);
    const sFormattedDate = `${oEventDate.getFullYear()}-${oEventDate.getMonth() + 1}-${oEventDate.getDate()}`;

    const iIndex = this.m_asDates.findIndex(sDateStr => {
      const oDate = new Date(sDateStr);
      return (
        oDate.getFullYear() === oEventDate.getFullYear() &&
        oDate.getMonth() === oEventDate.getMonth() &&
        oDate.getDate() === oEventDate.getDate()
      );
    });

    if (iIndex >= 0) {
      this.m_iSliderValue = iIndex;
      this.dateSelected({ target: { value: iIndex, eventId: oEvent.id } } as any,bChangedByUser); // simulate slider input
    } else {
      console.warn('Could not find event date in current timeline:', sFormattedDate);
    }
  }


  protected readonly EventType = EventType;
}
