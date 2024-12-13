import {Component, Input, OnInit} from '@angular/core';
import {Chart, registerables} from "chart.js";
const oRiseGold = getComputedStyle(document.documentElement).getPropertyValue('--rise-gold').trim();

@Component({
  selector: 'rise-histogram',
  standalone: true,
  imports: [],
  templateUrl: './rise-histogram.component.html',
  styleUrl: './rise-histogram.component.css'
})
export class RiseHistogramComponent implements OnInit{
  @Input() aiPixelValues: number[] = [10, 20, 30, 40, 50]; // Fixed for now
  @Input() sUnit: string = 'Jy bm^-1'; // Fixed for now

  constructor() {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.createHistogram();
  }

  createHistogram(): void {
    const oLabels = this.aiPixelValues.map((_, i) => `Bin ${i + 1}`); // Example bins
    const oData = this.aiPixelValues;

    new Chart('histogram', {
      type: 'bar',
      data: {
        labels: oLabels,
        datasets: [
          {
            label: `Pixels (${this.sUnit})`,
            data: oData,
            backgroundColor: oRiseGold,
            borderColor: oRiseGold,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
        },
        scales: {
          x: { title: { display: true, text: '(Jy bm-1)' } },
          y: { title: { display: true, text: 'Number of 0\'\' .5 Pixels'  } },
        },
      },
    });
  }
}
