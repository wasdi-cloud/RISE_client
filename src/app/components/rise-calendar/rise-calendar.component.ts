import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInput, MatInputModule} from "@angular/material/input";
import {
  MatCalendarCellClassFunction,
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle
} from "@angular/material/datepicker";
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule} from "@angular/material/core";
import {FormsModule} from "@angular/forms";
import {MomentDateAdapter} from "@angular/material-moment-adapter";
import moment from "moment";
import {DatePipe, NgIf} from "@angular/common";

export const CUSTOM_DATE_FORMATS = {
  parse: { dateInput: 'ddd MMM DD YYYY' }, // Parsing format
  display: {
    dateInput: 'ddd MMM DD YYYY', // Display format in input
    monthYearLabel: 'MMM YYYY', // Format for month/year selector
    dateA11yLabel: 'LL', // Accessible format for screen readers
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
  selector: 'rise-calendar',
  standalone: true,
  imports: [
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    DatePipe,
    NgIf
  ],
  providers: [
    // provideNativeDateAdapter()
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rise-calendar.component.html',
  styleUrl: './rise-calendar.component.css'
})
export class RiseCalendarComponent implements OnInit,OnChanges{




  /**
   * Selected date to display
   *
   */
  @Input() m_oSelectedDate:Date ;


  m_oDisplayDate: Date | null = null;
  /**
   * Flag to display time alongside the date (Useful for 1D mode)
   */
  @Input() m_bShowTime: boolean = false;

  /**
   * Highlighted / important dates to show in calendar
   *
   */
  @Input()
  m_aoHighlightDates: Date[] = [];

  /**
   * start date var to control the time zone which the user select a date from
   *
   */
  @Input() m_oStartDate:moment.Moment;
  /**
   * emitter for sending the date to timebar
   *
   */
  @Output() m_oSelectedDateFromCalendar: EventEmitter<{ date: string, isHighlighted: boolean }> = new EventEmitter();


  ngOnInit() {
    this.updateDisplayDate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['m_oSelectedDate']) {
    //   this.updateDisplayDate();
    // }
  }

  // 4. The safe calculation logic
  updateDisplayDate() {
    if (!this.m_oSelectedDate) {
      this.m_oDisplayDate = null;
      return;
    }

    // Safety: Ensure it's a real Date object (handles strings just in case)
    let oSafeDate = this.m_oSelectedDate;
    if (typeof oSafeDate === 'string') {
      oSafeDate = new Date(oSafeDate);
    }

    // Create the "Shadow Date" for the visual input
    // Takes UTC components -> Creates Local Date
    this.m_oDisplayDate = new Date(
      oSafeDate.getUTCFullYear(),
      oSafeDate.getUTCMonth(),
      oSafeDate.getUTCDate(),
      12, 0, 0 // Noon Local
    );
  }



  /**
   * set the clickable dates from start date to current date
   *
   */
  dateFilter = (date: moment.Moment | null): boolean => {
    const currentDate = date || moment();
    const now = moment(); // Today's date
    if (!this.m_oStartDate) {
      return currentDate.isSameOrBefore(now, 'day');
    }

    // Enable only dates from startDate to today
    return currentDate.isSameOrAfter(this.m_oStartDate, 'day') && currentDate.isSameOrBefore(now, 'day');
  };


  /**
   * highlight important dates
   *
   */
  dateClass: MatCalendarCellClassFunction<moment.Moment> = (cellDate, view) => {
    if (view === 'month') {
      // Get the year, month, and date from the Moment object
      const year = cellDate.year();
      const month = cellDate.month(); // January is 0, February is 1, etc.
      const date = cellDate.date();

      // Check if the current date matches any of the highlighted dates
      const highlight = this.m_aoHighlightDates.some((d) =>
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === date
      );

      return highlight ? 'highlight-date' : ''; // 'highlight-date' class applied if date matches
    }
    return '';
  };




  emitDate(event: any): void {
    // 1. Get the LOCAL date from the picker (e.g., July 1st 00:00 Local)
    const oLocalDate = event.value.toDate();

    // 2. CONVERT TO STRICT UTC
    // We take the Year, Month, Day from local, and force them into UTC.
    // This turns "July 1st Midnight Local" into "July 1st 00:00:00 UTC"
    const oUtcDate = new Date(Date.UTC(
      oLocalDate.getFullYear(),
      oLocalDate.getMonth(),
      oLocalDate.getDate(),
      0, 0, 0, 0
    ));

    this.m_oSelectedDate = oUtcDate;

    // 3. Highlight Check (Using UTC methods)
    const isHighlighted = this.m_aoHighlightDates.some(d =>
      d.getUTCFullYear() === this.m_oSelectedDate.getUTCFullYear() &&
      d.getUTCMonth() === this.m_oSelectedDate.getUTCMonth() &&
      d.getUTCDate() === this.m_oSelectedDate.getUTCDate()
    );

    // 4. EMIT ISO STRING
    // This sends "2024-07-01T00:00:00.000Z"
    // The Timebar will read this exact time, ignoring your local timezone.
    this.m_oSelectedDateFromCalendar.emit({
      date: this.m_oSelectedDate.toISOString(),
      isHighlighted: isHighlighted
    });
  }

}
