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
import {TranslateModule} from "@ngx-translate/core";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

@Component({
  selector: 'rise-timebar',
  standalone: true,
  imports: [CommonModule, RiseButtonComponent, MatTooltip, RiseCalendarComponent, TranslateModule],
  templateUrl: './rise-timebar.component.html',
  styleUrl: './rise-timebar.component.css',
})
export class RiseTimebarComponent implements OnInit, OnChanges {
  /**
   * UC_190 Browse Time
   */

  /**
   * Available time range options
   */
  m_asTimeRanges: string[] = ['Auto', '1Y', '1M', '1W', '1D'];

  /**
   * The currently selected time range. Defaults to 'Auto'
   */
  m_sSelectedTimeRange: string = 'Auto';
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
  m_bDisableNextButton: boolean=false;
  m_bDisablePrevButton: boolean=false;

  constructor() {
  }

  ngOnInit(): void {
    this.initDates(false);
    this.generateTicks();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If m_iEndDate changes (Live update from parent)
    if (changes['m_iEndDate'] && !changes['m_iEndDate'].firstChange) {

      // CASE 1: Auto Mode - Always reset to full scope
      if (this.m_sSelectedTimeRange === 'Auto') {
        this.initDates(false);
      }
      // CASE 2: Zoom Mode (1D, 1W, etc.)
      else {
        // CRITICAL FIX: Only jump to the new "Live" time if we were ALREADY Live.
        if (this.m_bIsLive) {
          // 1. Update internal selected date to the new live time
          this.m_oSelectedDate = new Date(this.m_iEndDate * 1000);
          // 2. Shift the window
          this.onTimeRangeSelected(this.m_sSelectedTimeRange);
        }
        else {
          // If NOT live (user is looking at history), do NOT move the cursor.
          // We optionally regenerate the array to include the new data at the end,
          // but we keep m_oSelectedDate exactly where the user put it.
          // For now, doing nothing is safer to prevent jumping.
        }
      }

    } else {
      // First load
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

    // Safety check
    if (!this.m_asDates || this.m_asDates.length === 0) return "0%";

    // 1. Determine Current Window Boundaries
    // We parse the strings in m_asDates to get exact timestamps
    const iViewStart = new Date(this.m_asDates[0]).getTime();
    const iViewEnd = new Date(this.m_asDates[this.m_asDates.length - 1]).getTime();

    // 2. Calculate Duration of the current view
    const iDuration = iViewEnd - iViewStart;

    // Avoid division by zero (e.g., if start == end)
    if (iDuration <= 0) return "0%";

    // 3. Check if event is strictly inside (Optional, as getVisibleEvents handles this,
    // but good for safety to prevent CSS from drawing way off-screen)
    if (iEventTimestamp < iViewStart || iEventTimestamp > iViewEnd) {
      return "-1000px"; // Hide it off-screen just in case
    }

    // 4. Calculate Percentage
    const fPercent = (iEventTimestamp - iViewStart) / iDuration;

    return `${fPercent * 100}%`;
  }

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(oEvent: MouseEvent) {
    this.updateSliderCursor();
  }

  onTimeRangeSelected(sRange: string): void {
    this.m_sSelectedTimeRange = sRange;

    if (sRange === 'Auto') {
      this.initDates(false);
      this.generateTicks();
      return;
    }

    let oBaseDate = new Date(this.m_oSelectedDate);
    const iGlobalEndTimestamp = this.m_iEndDate * 1000;

    let oStartDate = new Date(oBaseDate);
    let oEndDate = new Date(oBaseDate);

    switch (sRange) {
      case '1Y':
        oStartDate.setUTCFullYear(oStartDate.getUTCFullYear() - 1);
        break;
      case '1M':
        oStartDate.setUTCMonth(oStartDate.getUTCMonth() - 1);
        break;
      case '1W':
        oStartDate.setUTCDate(oStartDate.getUTCDate() - 7);
        break;
      case '1D':
        const iDiffFromNow = Math.abs(iGlobalEndTimestamp - oBaseDate.getTime());
        const bIsToday = iDiffFromNow < (24 * 60 * 60 * 1000) && oBaseDate.getTime() <= iGlobalEndTimestamp;

        if (this.m_bIsLive || bIsToday) {
          // Rolling Window (UTC)
          oEndDate = new Date(iGlobalEndTimestamp);
          oEndDate.setUTCMinutes(0, 0, 0);
          oStartDate = new Date(oEndDate);
          oStartDate.setUTCDate(oStartDate.getUTCDate() - 1);
        }
        else {
          // Calendar Day (UTC)
          oStartDate.setUTCHours(0, 0, 0, 0);
          oEndDate = new Date(oStartDate);
          oEndDate.setUTCHours(23, 0, 0, 0);
        }
        break;
    }

    // Boundary Check (Global Start)
    const iGlobalStartTimestamp = this.m_iStartDate * 1000;
    if (oStartDate.getTime() < iGlobalStartTimestamp) {
      oStartDate = new Date(iGlobalStartTimestamp);
    }

    // Boundary Check (Global End)
    // If our calculation pushed us into the future (e.g. 1M from today?), clamp it.
    if (oEndDate.getTime() > iGlobalEndTimestamp) {
      oEndDate = new Date(iGlobalEndTimestamp);
    }

    // 3. REGENERATE SLIDER ARRAY
    const bIsHourly = sRange === '1D';
    this.generateDateArray(oStartDate, oEndDate, bIsHourly);

    // 4. Update Slider Position
    if (sRange === '1D') {
      if (this.m_bIsLive || (oBaseDate.getTime() >= oEndDate.getTime())) {
        // If we are live, or the selected time was clamped, go to end
        this.m_iSliderValue = this.m_asDates.length - 1;
      } else {
        // History: Try to find the matching hour
        // Since we start at 00:00, the index is usually the hour
        const iTargetHour = oBaseDate.getHours();
        this.m_iSliderValue = iTargetHour;

        // Safety clamp
        if(this.m_iSliderValue >= this.m_asDates.length) {
          this.m_iSliderValue = this.m_asDates.length - 1;
        }
      }
    }
    else {
      this.m_iSliderValue = this.m_asDates.length - 1;
    }

    this.m_sSelectedDate = this.m_asDates[this.m_iSliderValue];

    // 5. Generate Ticks
    this.generateZoomedTicks(oStartDate, oEndDate, sRange);

    this.updateButtonsState();
  }

  generateZoomedTicks(oStartDate: Date, oEndDate: Date, sRange: string) {
    this.m_aiTicks = [];
    let oIterDate = new Date(oStartDate);

    // SNAP TO UTC MIDNIGHT for non-hourly modes
    if (sRange !== '1D') {
      oIterDate.setUTCHours(0, 0, 0, 0);
    }

    if (sRange === '1Y') {
      // Logic: Show Month names
      // Ensure we start at the beginning of the month so ticks don't land on "8th of Dec, 8th of Jan"
      oIterDate.setUTCDate(1);
      while (oIterDate <= oEndDate) {
        this.m_aiTicks.push({
          value: MONTHS[oIterDate.getUTCMonth()],
          timestamp: oIterDate.getTime()
        });
        oIterDate.setUTCMonth(oIterDate.getUTCMonth() + 1);
      }
    }

    else if (sRange === '1M') {
      // Logic: Show Days (every 7 days, or every 5 days depending on preference)
      while (oIterDate <= oEndDate) {
        this.m_aiTicks.push({
          value: oIterDate.getDate(),
          timestamp: oIterDate.getTime()
        });
        oIterDate.setUTCDate(oIterDate.getDate() + 7);
      }
    }

    else if (sRange === '1W') {
      // Logic: Show Every Day
      while (oIterDate <= oEndDate) {
        this.m_aiTicks.push({
          value: oIterDate.getDate(),
          timestamp: oIterDate.getTime()
        });
        oIterDate.setUTCDate(oIterDate.getDate() + 1);
      }
    }

    else if (sRange === '1D') {
      // 1D Logic
      // Ensure we start iterating from the clean oStartDate calculated previously
      // It should already be at XX:00:00 due to step 1

      while (oIterDate <= oEndDate) {
        // UTC Hour
        const sHour = oIterDate.getUTCHours().toString().padStart(2, '0') + ':00';
        this.m_aiTicks.push({ value: sHour, timestamp: oIterDate.getTime() });
        oIterDate.setUTCHours(oIterDate.getUTCHours() + 4);
      }
    }
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(oEvent: MouseEvent) {
    this.m_sSliderClass = ''; // Reset the cursor when leaving
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

      // Adjust an interval based on range
      if (iYearRange > 50) {
        interval = 10; // One tick every 10 years for ranges over 50 years
      } else if (iYearRange > 20) {
        interval = 5; // One tick every 5 years for ranges over 20 years
      } else if (iYearRange > 10) {
        interval = 2; // One tick every 2 years for ranges over 10 years
      }

      this.generateYearTicks(iStartYear,iEndYear,interval);

    }
    else {
      //same year
      if (iYearRange == 0) {

        if (iEndMonth - iStartMonth >= 1) {

          for (let iMonth = iStartMonth; iMonth <= iEndMonth; iMonth++) {
            this.m_aiTicks.push({value: MONTHS[iMonth], timestamp: new Date(iCurrentYear, iMonth, 1).getTime()});
          }

        }
        else {
          for (let iDay = iStartDay; iDay <= iEndDay; iDay++) {
            this.m_aiTicks.push({value: iDay, timestamp: new Date(iCurrentYear, iCurrentMonth, iDay).getTime()});
          }

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

        }
        else {
          for (let iDay = iStartDay; iDay <= iEndDay; iDay++) {
            this.m_aiTicks.push({value: iDay, timestamp: new Date(iEndYear, iEndMonth, iDay).getTime()});
          }


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
    if (!oTick || !oTick.timestamp) return "0%";

    // Get current view boundaries from the m_asDates array
    // m_asDates stores strings, so we convert boundaries to timestamps
    const sStart = this.m_asDates[0];
    const sEnd = this.m_asDates[this.m_asDates.length - 1];

    const iStartTimestamp = new Date(sStart).getTime();
    const iEndTimestamp = new Date(sEnd).getTime();

    const iTotalDuration = iEndTimestamp - iStartTimestamp;

    // Avoid division by zero (e.g. if 1D view where start=end, though usually 1D is 24h diff)
    if (iTotalDuration === 0) return "0%";

    const iTickOffset = oTick.timestamp - iStartTimestamp;
    const fPercentage = (iTickOffset / iTotalDuration) * 100;

    // Clamp between 0 and 100
    if(fPercentage < 0) return "0%";
    if(fPercentage > 100) return "100%";

    return `${fPercentage}%`;
  }

  /**
   * UPDATED: InitDates now uses the helper
   */
  initDates(bChangedByUser: boolean): void {
    if (
      FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_iStartDate) ||
      FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_iEndDate)
    ) {
      return;
    }

    this.m_oMomentStartDate = moment(this.m_iStartDate * 1000);
    let oStartDate = new Date(this.m_iStartDate * 1000);
    let oEndDate = new Date(this.m_iEndDate * 1000);

    // Use the new helper
    this.generateDateArray(oStartDate, oEndDate);

    // Logic for selection remains the same...
    if (this.m_iInitialSelectedDate && this.m_iInitialSelectedDate >= this.m_iStartDate && this.m_iInitialSelectedDate <= this.m_iEndDate) {
      this.m_sSelectedDate = new Date(this.m_iInitialSelectedDate * 1000).toDateString();
      this.m_iSliderValue = this.m_asDates.indexOf(this.m_sSelectedDate);
      this.m_oSelectedDate = new Date(this.m_iInitialSelectedDate * 1000);
    } else {
      this.m_sSelectedDate = this.m_asDates[this.m_asDates.length - 1];
      this.m_iSliderValue = this.m_asDates.length - 1;
      this.m_oSelectedDate = oEndDate;
    }

    this.m_bIsLive = this.m_sSelectedDate === this.m_asDates[this.m_asDates.length - 1];
    this.m_sSelectedDateTimestamp = this.m_oSelectedDate.valueOf();

    // Only emit if necessary (logic unchanged)
    this.emitSelectedDate(null, bChangedByUser);
    this.updateButtonsState();
  }

  /**
   * Get the selected tick on the timebar and match it to the corresponding date in the dates array and find the timestamp
   * UC: User can click on a date in the time bar
   * @param oEvent
   * @param bChangedByUser
   * @returns void
   */
  /**
   * Get the selected tick on the timebar and match it to the corresponding date in the dates array
   */
  dateSelected(oEvent, bChangedByUser: boolean): void {

    // 1. Get the String from Slider/Event
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent.target)) {
      this.m_sSelectedDate = this.m_asDates[oEvent.target.value];
      this.m_iSliderValue = Number(oEvent.target.value);
    }
    else {
      // Handle input from Calendar or external sources
      this.m_sSelectedDate = oEvent.date;

      // If coming from Calendar, m_asDates might not contain this specific date string (if it stripped time)
      // So we rely on creating a new Date object below.
      this.m_iSliderValue = this.m_asDates.indexOf(this.m_sSelectedDate);
    }

    // 2. Create the Date Object
    this.m_oSelectedDate = new Date(this.m_sSelectedDate);

    // 3. FORCE TIME LOGIC
    this.m_oSelectedDate = new Date(this.m_sSelectedDate);


    //NOTE: This made like that for readability
    if (this.m_sSelectedTimeRange === '1D') {
      // Trust the specific UTC hour from the ISO string
    } else {
      // Force End of UTC Day
      this.m_oSelectedDate.setUTCHours(23, 59, 59, 999);
    }

    // 4. Update Timestamp
    this.m_sSelectedDateTimestamp = this.m_oSelectedDate.valueOf();

    // 5. CRITICAL FIX: Smart Live Detection
    // We are only live if:
    // A. The slider is at the very last position
    // B. AND The date at that position is actually close to the Global End Date (Real Time)

    const bAtSliderEnd = this.m_iSliderValue === this.m_asDates.length - 1;

    if (bAtSliderEnd) {
      const iGlobalEndTimestamp = this.m_iEndDate * 1000;
      const iDiff = Math.abs(iGlobalEndTimestamp - this.m_sSelectedDateTimestamp);

      // Define a "Live Threshold".
      // If we are in 1D mode (hours), the difference should be small (e.g., < 4 hours).
      // If we are in 1M/1Y mode (days), the difference can be up to 24 hours.
      const iThreshold = (this.m_sSelectedTimeRange === '1D') ? (4 * 60 * 60 * 1000) : (24 * 60 * 60 * 1000);

      // If the difference is huge (e.g., selected is 2023, global is 2025), this will be FALSE.
      this.m_bIsLive = iDiff < iThreshold;
    }
    else {
      this.m_bIsLive = false;
    }

    this.emitLiveButtonAction();

    // 6. Highlight Logic (Unchanged)
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent.isHighlighted) && oEvent.isHighlighted) {
      for (let i = 0; i < this.m_aoEvents.length; i++) {
        const oEventDate = new Date(this.m_aoEvents[i].peakDate * 1000);
        if (this.compareDatesByDay(oEventDate, this.m_oSelectedDate)) {
          this.emitSelectedDate(this.m_aoEvents[i].id, bChangedByUser)
          break;
        }
      }
    } else if (FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent.target?.eventId)) {
      this.emitSelectedDate(null, bChangedByUser);
    } else {
      this.emitSelectedDate(oEvent.target.eventId, bChangedByUser);
    }

    this.updateButtonsState();
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
    this.updateButtonsState();
  }

  /**
   * this method update the state of the minus and add button in the time bar
   *
   */

  updateButtonsState() {
    // Convert current selected to timestamp
    const iCurrent = this.m_oSelectedDate.getTime();
    const iGlobalEnd = this.m_iEndDate * 1000;
    const iGlobalStart = this.m_iStartDate * 1000;

    // Disable Next if we are effectively at "Now" (or within 1 step)
    this.m_bDisableNextButton = iCurrent >= iGlobalEnd;

    // Disable Prev if we are at Start
    this.m_bDisablePrevButton = iCurrent <= iGlobalStart;
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

    this.updateButtonsState();
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



  getVisibleEvents(): EventViewModel[] {
    if (!this.m_aoEvents || this.m_asDates.length === 0) return [];

    // 1. Get Boundaries
    const iViewStart = new Date(this.m_asDates[0]).getTime();
    const iViewEnd = new Date(this.m_asDates[this.m_asDates.length - 1]).getTime();

    // 2. Filter Events
    return this.m_aoEvents.filter(event => {
      const iEventTime = event.peakDate * 1000;
      return iEventTime >= iViewStart && iEventTime <= iViewEnd;
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

  /**
   * Generates the array of dates for the slider.
   * Added bHighResolution for '1D' mode to include hours.
   */
  // rise-timebar.component.ts

  generateDateArray(oStartDate: Date, oEndDate: Date, bHighResolution: boolean = false): void {
    let asDates = [];
    // Clone and force UTC
    let oIterDate = new Date(oStartDate);

    // Safety: prevent infinite loops
    if (oIterDate.getTime() > oEndDate.getTime()) return;

    while (oIterDate.getTime() <= oEndDate.getTime()) {
      if (bHighResolution) {
        // 1D Mode: Use ISO String (e.g., "2025-12-08T14:00:00.000Z")
        asDates.push(oIterDate.toISOString());
        oIterDate.setUTCHours(oIterDate.getUTCHours() + 1);
      } else {
        // Standard Mode: Use YYYY-MM-DD
        asDates.push(oIterDate.toISOString().split('T')[0]);
        oIterDate.setUTCDate(oIterDate.getUTCDate() + 1);
      }
    }

    // Handle last value
    let sLastVal = bHighResolution ? oEndDate.toISOString() : oEndDate.toISOString().split('T')[0];
    if (asDates.length > 0 && asDates[asDates.length - 1] !== sLastVal) {
      asDates.push(sLastVal);
    }

    this.m_asDates = asDates;
  }


  /**
   * UNIFIED STEP HANDLER
   * Handles Next/Prev clicks with context-aware steps
   * @param iSign  1 for Next, -1 for Previous
   */
  changeTimeStep(iSign: number) {

    // 1. Calculate the New Date based on the Range
    // Clone the current date to avoid mutation side effects until we are ready
    const oNewDate = new Date(this.m_oSelectedDate);

    // Apply the logic requested:
    // Auto -> 1 Day (Default)
    // 1Y   -> 1 Month
    // 1M   -> 1 Week
    // 1W   -> 1 Day
    // 1D   -> 1 Hour

    switch (this.m_sSelectedTimeRange) {
      case 'Auto':
        oNewDate.setDate(oNewDate.getDate() + iSign);
        break;
      case '1Y':
        oNewDate.setMonth(oNewDate.getMonth() + iSign);
        break;
      case '1M':
        oNewDate.setDate(oNewDate.getDate() + (iSign * 7));
        break;
      case '1W':
        oNewDate.setDate(oNewDate.getDate() + iSign);
        break;
      case '1D':
        oNewDate.setHours(oNewDate.getHours() + iSign);
        break;
      default:
        // Fallback
        oNewDate.setDate(oNewDate.getDate() + iSign);
        break;
    }

    // 2. Boundary Checks
    // Ensure we don't go before the global start or after the global end (Now)
    const iGlobalStart = this.m_iStartDate * 1000;
    const iGlobalEnd = this.m_iEndDate * 1000;

    if (oNewDate.getTime() < iGlobalStart) {
      // console.log("Cannot go before start date");
      return;
    }

    // Optional: Allow going slightly into the future? Usually no.
    // If you want to stop exactly at "Now":
    if (oNewDate.getTime() > iGlobalEnd) {
      // Check if we are already live, if so, do nothing.
      // Or just clamp it.
      // console.log("Cannot go into the future");
      return;
    }


    // 3. EXECUTE THE CHANGE
    this.m_oSelectedDate = oNewDate;

    // Case A: AUTO MODE
    // We don't need to regenerate the view/ticks. We just move the slider cursor.
    if (this.m_sSelectedTimeRange === 'Auto') {
      this.m_sSelectedDate = this.m_oSelectedDate.toDateString();
      // Find new index
      const iNewIndex = this.m_asDates.indexOf(this.m_sSelectedDate);

      if (iNewIndex !== -1) {
        this.m_iSliderValue = iNewIndex;
        // Trigger the standard selection logic to emit events and update UI
        // We simulate an event object
        this.dateSelected({ target: { value: iNewIndex } }, true);
      }
    }

      // Case B: ZOOM MODE (1Y, 1M, 1W, 1D)
      // We need to shift the whole window.
      // Calling onTimeRangeSelected will recalculate the Start/End window
    // centered around our new m_oSelectedDate and regenerate ticks.
    else {
      this.onTimeRangeSelected(this.m_sSelectedTimeRange);

      // Manually trigger emit since onTimeRangeSelected mostly updates UI
      this.m_sSelectedDateTimestamp = this.m_oSelectedDate.valueOf();
      this.emitSelectedDate(null, true);
    }

    // 4. Update Button States (Disable if at end/start)
    this.updateButtonsState();
  }
}
