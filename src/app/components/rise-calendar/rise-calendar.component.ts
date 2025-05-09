import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
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
    FormsModule
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
export class RiseCalendarComponent implements OnInit{




  /**
   * Selected date to display
   *
   */
  @Input() m_oSelectedDate:Date ;

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


  /**
   * emit selected date back to timebar
   *
   */
  emitDate(event: any): void {
    this.m_oSelectedDate = event.value.toDate(); // Update selected date as Date

    const isHighlighted = this.m_aoHighlightDates.some(d =>
      d.getFullYear() === this.m_oSelectedDate.getFullYear() &&
      d.getMonth() === this.m_oSelectedDate.getMonth() &&
      d.getDate() === this.m_oSelectedDate.getDate()
    );

    console.log('Selected date is highlighted:', isHighlighted);

    this.m_oSelectedDateFromCalendar.emit({
      date: this.m_oSelectedDate.toDateString(),
      isHighlighted: isHighlighted
    });
  }

}
