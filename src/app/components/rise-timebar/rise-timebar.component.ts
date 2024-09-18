import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, Input } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';

@Component({
  selector: 'rise-timebar',
  standalone: true,
  imports: [CommonModule, CdkDrag,],
  templateUrl: './rise-timebar.component.html',
  styleUrl: './rise-timebar.component.css'
})
export class RiseTimebarComponent {
  @ViewChild('draggable') m_oDraggableRef!: ElementRef;
  @ViewChild('dragZone') m_oDragZoneRef!: ElementRef;

  @Input() m_asDateRange: Array<string> = [];
  @Input() m_iFrames: number = 5;

  m_iShownFrame: number = 1;

  m_aoDates: Array<Date> = [];

  constructor() { }

  ngOnInit(): void {
    this.initDates()
  }

  initDates() {
    const datesArray = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(); // current date
      const nextDate = new Date(date.setDate(date.getDate() + i)); // add 'i' days to current date
      datesArray.push(nextDate);
    }
    this.m_aoDates = datesArray;
    console.log(datesArray); // output: [Date, Date, Date, Date, Date]
  }

  onDrop(oEvent: any) {
    const iWidth = this.m_oDragZoneRef.nativeElement.offsetWidth;

    const aiDropPoints = iWidth / this.m_iFrames;
    if (this.m_iShownFrame > this.m_iFrames) {
      this.m_iShownFrame = this.m_iFrames;
    }
    console.log(aiDropPoints)
    console.log(iWidth)
    console.log(oEvent)
  }

  setTimeframe() { }
}
