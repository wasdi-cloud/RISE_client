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

    // 1. Get the cursor date
    let oBaseDate = new Date(this.m_oSelectedDate);

    // 2. Define Global Limits
    const iGlobalEndTimestamp = this.m_iEndDate * 1000;
    const iGlobalStartTimestamp = this.m_iStartDate * 1000;

    let oStartDate: Date;
    let oEndDate: Date;

    if (sRange === '1D') {
      // --- LOGIC FOR 1 DAY VIEW ---

      // Determine if we should be in "Live Rolling Window" mode
      const iDiffFromNow = Math.abs(iGlobalEndTimestamp - oBaseDate.getTime());
      // Only use rolling window if we are very close to the global end AND explicitly live
      // This prevents the "Mode Jump" when scrolling back
      const bUseRollingWindow = this.m_bIsLive && (iDiffFromNow < 4 * 60 * 60 * 1000);

      if (bUseRollingWindow) {
        // Mode A: LIVE (Rolling 24h Window)
        oEndDate = new Date(iGlobalEndTimestamp);
        oEndDate.setUTCMinutes(0, 0, 0);
        oStartDate = new Date(oEndDate);
        oStartDate.setUTCDate(oStartDate.getUTCDate() - 1);
      }
      else {
        // Mode B: HISTORY (Strict UTC Calendar Day)

        // CRITICAL FIX IS HERE -----------------------------------------
        // We do NOT use oBaseDate.getDate() (Local).
        // We use oBaseDate.getUTCDate() (Absolute).
        // This ensures 21:00 UTC and 22:00 UTC both map to the SAME day,
        // even if 22:00 is technically "Tomorrow" in your Local Timezone.
        // --------------------------------------------------------------

        const iUTCMidnight = Date.UTC(
          oBaseDate.getUTCFullYear(),
          oBaseDate.getUTCMonth(),
          oBaseDate.getUTCDate(),
          0, 0, 0, 0
        );

        oStartDate = new Date(iUTCMidnight); // 00:00 UTC

        oEndDate = new Date(oStartDate);
        oEndDate.setUTCHours(23, 0, 0, 0);   // 23:00 UTC
      }
    }
    else {
      // --- LOGIC FOR 1W / 1M / 1Y ---
      // Clone base date
      oStartDate = new Date(oBaseDate);

      // Ensure we modify UTC components to prevent DST shifts
      switch (sRange) {
        case '1Y': oStartDate.setUTCFullYear(oStartDate.getUTCFullYear() - 1); break;
        case '1M': oStartDate.setUTCMonth(oStartDate.getUTCMonth() - 1); break;
        case '1W': oStartDate.setUTCDate(oStartDate.getUTCDate() - 7); break;
      }
      oEndDate = new Date(oBaseDate);
    }

    // 3. Clamp to Global Boundaries
    if (oStartDate.getTime() < iGlobalStartTimestamp) {
      oStartDate = new Date(iGlobalStartTimestamp);
    }
    if (oEndDate.getTime() > iGlobalEndTimestamp) {
      oEndDate = new Date(iGlobalEndTimestamp);
    }

    // 4. Regenerate Dates Array
    const bIsHourly = sRange === '1D';
    this.generateDateArray(oStartDate, oEndDate, bIsHourly);

    // 5. Restore Slider Position
    // Now that m_asDates is generated correctly (UTC), we find where our hour fits.
    if (sRange === '1D') {
      // Create a search string for the hour: "YYYY-MM-DDTHH"
      const sTargetIso = oBaseDate.toISOString().substring(0, 13);

      const iMatchIndex = this.m_asDates.findIndex(d => d.startsWith(sTargetIso));

      if (iMatchIndex !== -1) {
        this.m_iSliderValue = iMatchIndex;
      } else {
        // If exact match not found (e.g. we just switched days),
        // determine if we should be at Start or End based on context
        const iBaseTime = oBaseDate.getTime();
        const iStartTime = oStartDate.getTime();
        const iEndTime = oEndDate.getTime();

        // If our time is AFTER this window, go to End
        if (iBaseTime >= iEndTime) this.m_iSliderValue = this.m_asDates.length - 1;
        // If our time is BEFORE this window, go to Start
        else if (iBaseTime <= iStartTime) this.m_iSliderValue = 0;
        // Default
        else this.m_iSliderValue = this.m_asDates.length - 1;
      }
    } else {
      this.m_iSliderValue = this.m_asDates.length - 1;
    }

    // 6. Final Sync
    this.m_sSelectedDate = this.m_asDates[this.m_iSliderValue];
    if(this.m_sSelectedDate) {
      this.m_oSelectedDate = new Date(this.m_sSelectedDate);
    }

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
      while (oIterDate.getTime() <= oEndDate.getTime()) {
        // USE UTC HOURS for the label
        const sHour = oIterDate.getUTCHours().toString().padStart(2, '0') + ':00';

        this.m_aiTicks.push({ value: sHour, timestamp: oIterDate.getTime() });

        // STRICT UTC INCREMENT
        oIterDate.setUTCHours(oIterDate.getUTCHours() + 1);
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
    this.m_iStartDate = this.m_iStartDate == -1 ? 1420130166 : this.m_iStartDate;

    // USE UTC METHODS
    const iStartDate = new Date(this.m_iStartDate * 1000);
    const iStartYear = iStartDate.getUTCFullYear();
    const iStartMonth = iStartDate.getUTCMonth();
    const iStartDay = iStartDate.getUTCDate();

    const iEndDate = new Date(this.m_iEndDate * 1000);
    const iEndYear = iEndDate.getUTCFullYear();
    const iEndMonth = iEndDate.getUTCMonth();
    const iEndDay = iEndDate.getUTCDate();

    const iYearRange = iEndYear - iStartYear;
    this.m_aiTicks = [];

    // Use UTC for current year reference too
    let iCurrentYear = new Date().getUTCFullYear();

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
            this.m_aiTicks.push({value: MONTHS[iMonth], timestamp: Date.UTC(iCurrentYear, iMonth, 1)});
          }

        }
        else {
          for (let iDay = iStartDay; iDay <= iEndDay; iDay++) {
            this.m_aiTicks.push({value: iDay, timestamp: Date.UTC(iCurrentYear, iEndMonth, iDay)});
          }

        }
      }
      //different  year
      else {
        if (Math.abs(iEndMonth - iStartMonth) >= 1) {
          for (let iMonth = iStartMonth; iMonth < 12; iMonth++) {
            this.m_aiTicks.push({value: MONTHS[iMonth], timestamp: Date.UTC(iStartYear, iMonth, 1)});
          }
          for (let iMonth = 0; iMonth <= iEndMonth; iMonth++) {
            this.m_aiTicks.push({value: MONTHS[iMonth], timestamp: Date.UTC(iEndYear, iMonth, 1)});
          }

        }
        else {
          for (let iDay = iStartDay; iDay <= iEndDay; iDay++) {
            this.m_aiTicks.push({value: iDay, timestamp: Date.UTC(iEndYear, iEndMonth, iDay)});
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

  initDates(bChangedByUser: boolean): void {
    if (
      FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_iStartDate) ||
      FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_iEndDate)
    ) {
      return;
    }

    this.m_oMomentStartDate = moment(this.m_iStartDate * 1000);

    // 1. Raw Objects (Correct Timestamp)
    let oStartDate = new Date(this.m_iStartDate * 1000);
    let oEndDate = new Date(this.m_iEndDate * 1000);

    // 2. Generate the Master Array (Strictly UTC)
    // Make sure generateDateArray is using .toISOString() internally!
    this.generateDateArray(oStartDate, oEndDate);

    // 3. Handle Initial Selection (Strictly UTC)
    if (this.m_iInitialSelectedDate && this.m_iInitialSelectedDate >= this.m_iStartDate && this.m_iInitialSelectedDate <= this.m_iEndDate) {

      let oInitDate = new Date(this.m_iInitialSelectedDate * 1000);


      this.m_oSelectedDate = oInitDate;

      // Convert to the string format used in m_asDates (YYYY-MM-DD or ISO)
      // Assuming m_asDates stores "YYYY-MM-DD" for non-1D modes:
      const sIsoDate = oInitDate.toISOString().split('T')[0];

      // Try to find the date in our array
      // Note: If 1D mode, m_asDates might have hours, so we might need fuzzy matching
      let iIdx = this.m_asDates.indexOf(sIsoDate);

      if (iIdx === -1) {
        // Fallback for 1D mode (where array has T00, T01...)
        // Find the entry that starts with our date
        iIdx = this.m_asDates.findIndex(d => d.startsWith(sIsoDate));
      }

      if (iIdx !== -1) {
        this.m_iSliderValue = iIdx;
        this.m_sSelectedDate = this.m_asDates[iIdx];
      } else {
        // Safety Fallback
        this.m_iSliderValue = this.m_asDates.length - 1;
        this.m_sSelectedDate = this.m_asDates[this.m_iSliderValue];
      }

    } else {
      // Default to End (Live)
      this.m_sSelectedDate = this.m_asDates[this.m_asDates.length - 1];
      this.m_iSliderValue = this.m_asDates.length - 1;
      this.m_oSelectedDate = oEndDate;
    }

    this.m_bIsLive = this.m_sSelectedDate === this.m_asDates[this.m_asDates.length - 1];
    this.m_sSelectedDateTimestamp = this.m_oSelectedDate.valueOf();

    this.emitSelectedDate(null, bChangedByUser);
    this.updateButtonsState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['m_iEndDate'] && !changes['m_iEndDate'].firstChange) {
      if (this.m_sSelectedTimeRange === 'Auto') {
        this.initDates(false);
      }
      else {
        if (this.m_bIsLive) {
          // STRICT UTC Update
          this.m_oSelectedDate = new Date(this.m_iEndDate * 1000);
          this.onTimeRangeSelected(this.m_sSelectedTimeRange);
        }
      }
    } else {
      this.initDates(false);
      this.generateTicks();
    }
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

    // 1. Get String/Value from Slider or Input
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent.target)) {
      this.m_iSliderValue = Number(oEvent.target.value);
      this.m_oSelectedDate = new Date(this.m_asDates[this.m_iSliderValue]); // ONE conversion only
      this.m_sSelectedDate = this.m_oSelectedDate.toISOString();
    }
    else {
      // Calendar gives a LOCAL date — normalize it to UTC DAY
      const oLocalDate = new Date(oEvent.date);

      const oUTCDate = new Date(Date.UTC(
        oLocalDate.getFullYear(),   // intentionally LOCAL getters
        oLocalDate.getMonth(),
        oLocalDate.getDate(),
        0, 0, 0, 0
      ));

      this.m_oSelectedDate = oUTCDate;
      this.m_sSelectedDate = oUTCDate.toISOString();
    }



    // 3. FORCE UTC TIME SNAPPING
    if (this.m_sSelectedTimeRange === '1D') {
      // CRITICAL FIX:
      // Even if the source was 23:59, we snap to 23:00:00.000
      this.m_oSelectedDate.setUTCMinutes(0, 0, 0);
    }
    else {
      // 1Y, 1M, Auto: Snap to End of Day
      this.m_oSelectedDate.setUTCHours(23, 59, 59, 999);
    }

    // -----------------------------------------------------------
    //UPDATE SLIDER POSITION (For Calendar Input)
    // -----------------------------------------------------------
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent.target)) {
      // We modified m_oSelectedDate (snapped). Now find where it fits in the array.

      // Convert our snapped object back to ISO string for comparison
      const s_SnappedIso = this.m_oSelectedDate.toISOString();

      // Try exact match first
      let iIdx = this.m_asDates.indexOf(s_SnappedIso);

      // If exact match fails (e.g. 1D mode has T00, T01... but we snapped to T00)
      if (iIdx === -1 && this.m_sSelectedTimeRange === '1D') {
        // Match by Year-Month-Day-Hour
        const sSearch = s_SnappedIso.substring(0, 13); // "2024-10-30T12"
        iIdx = this.m_asDates.findIndex(d => d.startsWith(sSearch));
      }
      else if (iIdx === -1) {
        // Match by Year-Month-Day
        const sSearch = s_SnappedIso.substring(0, 10); // "2024-10-30"
        iIdx = this.m_asDates.findIndex(d => d.startsWith(sSearch));
      }

      if (iIdx !== -1) {
        this.m_iSliderValue = iIdx;
        // Sync the string to the array value just in case
        this.m_sSelectedDate = this.m_asDates[iIdx];
      }
    }
    // -----------------------------------------------------------

    // 4. Update Timestamp
    this.m_sSelectedDateTimestamp = this.m_oSelectedDate.valueOf();

    // 5. Live Logic
    // Only Live if we are at the very last step of the slider
    const bAtSliderEnd = this.m_iSliderValue === this.m_asDates.length - 1;

    if (bAtSliderEnd) {
      const iGlobalEndTimestamp = this.m_iEndDate * 1000;
      const iDiff = Math.abs(iGlobalEndTimestamp - this.m_sSelectedDateTimestamp);
      // If we are within 4 hours of "Real Time", consider it Live
      const iThreshold = (this.m_sSelectedTimeRange === '1D') ? (4 * 60 * 60 * 1000) : (24 * 60 * 60 * 1000);
      this.m_bIsLive = iDiff < iThreshold;
    } else {
      this.m_bIsLive = false;
    }

    this.emitLiveButtonAction();

    // // 6. Highlight Logic (Unchanged)
    // if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent.isHighlighted) && oEvent.isHighlighted) {
    //   for (let i = 0; i < this.m_aoEvents.length; i++) {
    //     const oEventDate = new Date(this.m_aoEvents[i].peakDate * 1000);
    //     if (this.compareDatesByDay(oEventDate, this.m_oSelectedDate)) {
    //       this.emitSelectedDate(this.m_aoEvents[i].id, bChangedByUser)
    //       break;
    //     }
    //   }
    // } else if (FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent.target?.eventId)) {
    //   this.emitSelectedDate(null, bChangedByUser);
    // } else {
    //   this.emitSelectedDate(oEvent.target.eventId, bChangedByUser);
    // }
    //
    // this.updateButtonsState();
    // -----------------------------------------------------------------------
    // FIX IS HERE: UNIFIED EVENT LOOKUP
    // -----------------------------------------------------------------------
    let sEventIdToEmit = null;

    // Case A: User clicked a Flag (Explicit ID)
    if (oEvent.target?.eventId) {
      sEventIdToEmit = oEvent.target.eventId;
    }
    // Case B: User moved Slider or Calendar (Implicit Lookup)
    else {
      // Search our events array: Does the new m_oSelectedDate match any event?
      for (let i = 0; i < this.m_aoEvents.length; i++) {
        const oEventDate = new Date(this.m_aoEvents[i].peakDate * 1000);

        // Use your UTC comparator
        if (this.compareDatesByDay(oEventDate, this.m_oSelectedDate)) {
          sEventIdToEmit = this.m_aoEvents[i].id;
          break; // Found it!
        }
      }
    }

    // Emit the found ID (or null if none found)
    this.emitSelectedDate(sEventIdToEmit, bChangedByUser);
    // -----------------------------------------------------------------------

    this.updateButtonsState();
  }


  // Add this helper to your RiseCalendarComponent class

  get m_oDisplayDate(): Date | null {
    if (!this.m_oSelectedDate) return null;

    // TRICK: Construct a Local Date using the UTC values.
    // This forces the Local Calendar to display the same day as the UTC timestamp.
    return new Date(
      this.m_oSelectedDate.getUTCFullYear(),
      this.m_oSelectedDate.getUTCMonth(),
      this.m_oSelectedDate.getUTCDate(),
      12, 0, 0 // Noon Local (Safe middle of day)
    );
  }

  compareDatesByDay(date1: Date, date2: Date) {
    return (
      date1.getUTCFullYear() === date2.getUTCFullYear() &&
      date1.getUTCMonth() === date2.getUTCMonth() &&
      date1.getUTCDate() === date2.getUTCDate()
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


  /**
   * this method update the state of the minus and add button in the time bar
   *
   */
  updateButtonsState() {
    // NEW LOGIC: strictly based on the slider position

    // 1. Disable "Prev" if the slider is at the very beginning (Index 0)
    this.m_bDisablePrevButton = this.m_iSliderValue <= 0;

    // 2. Disable "Next" if the slider is at the very end (Last Index)
    this.m_bDisableNextButton = this.m_iSliderValue >= this.m_asDates.length - 1;
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
      this.m_aiTicks.push({value: iYear, timestamp: Date.UTC(iYear, 0, 1)});
    }

    this.m_oZoomWindow = {
      start: new Date(iStartYear, 0, 1).getTime(),
      end: new Date(iEndYear + 1, 0, 1).getTime(), // exclusive end
    };
  }

  goToEvent(oEvent: any, bChangedByUser: boolean): void {
    const iEventTimestamp = oEvent.peakDate * 1000;
    const oEventDate = new Date(iEventTimestamp);

    // FIX: Compare using UTC components, because m_asDates are strict UTC ISO strings
    const iIndex = this.m_asDates.findIndex(sDateStr => {
      const oDate = new Date(sDateStr);

      // Strict UTC comparison
      if (this.m_sSelectedTimeRange === '1D') {
        // In 1D, match the Hour
        // (Note: This assumes your event matches the hour exactly,
        // if not, we might need to check if it falls within the hour)
        return Math.abs(oDate.getTime() - iEventTimestamp) < 3600000; // Within 1 hour
      } else {
        // In other modes, match the Day
        return (
          oDate.getUTCFullYear() === oEventDate.getUTCFullYear() &&
          oDate.getUTCMonth() === oEventDate.getUTCMonth() &&
          oDate.getUTCDate() === oEventDate.getUTCDate()
        );
      }
    });

    if (iIndex >= 0) {
      this.m_iSliderValue = iIndex;
      this.m_sSelectedDate = this.m_asDates[iIndex]; // Sync the string
      // Pass true to simulate user interaction
      this.dateSelected({ target: { value: iIndex, eventId: oEvent.id } } as any, bChangedByUser);
    } else {
      console.warn('Could not find event date in current timeline');
    }
  }

  /**
   * Generates the array of dates for the slider.
   * Added bHighResolution for '1D' mode to include hours.
   */


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


  // rise-timebar.component.ts

  /**
   * UNIFIED STEP HANDLER
   * Strictly moves the slider cursor. Does NOT change the day/window.
   * @param iSign  1 for Next, -1 for Previous
   */
  changeTimeStep(iSign: number) {
    const iNewIndex = this.m_iSliderValue + iSign;

    if (iNewIndex < 0 || iNewIndex >= this.m_asDates.length) {
      return;
    }

    this.m_iSliderValue = iNewIndex;
    this.m_sSelectedDate = this.m_asDates[iNewIndex];

    this.dateSelected({ target: { value: iNewIndex } }, true);
  }

}
