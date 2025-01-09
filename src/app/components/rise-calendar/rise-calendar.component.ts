import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {MatFormField, MatFormFieldModule} from "@angular/material/form-field";
import {MatInput, MatInputModule} from "@angular/material/input";
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle
} from "@angular/material/datepicker";
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule} from "@angular/material/core";
import {MatIcon} from "@angular/material/icon";
import {FormsModule} from "@angular/forms";
import {DatePipe} from "@angular/common";
import {MomentDateAdapter} from "@angular/material-moment-adapter";

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
    MatFormField,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatIcon,
    FormsModule,
    DatePipe
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

  oSelectedDate: Date = new Date(); // Keep as Date for compatibility


  ngOnInit() {
  }
  emitDate(event: any): void {
    console.log(this.oSelectedDate)
    this.oSelectedDate = event.value; // Update selected date as Date
  }


}
