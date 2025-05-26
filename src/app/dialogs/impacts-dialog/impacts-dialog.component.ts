import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {RiseButtonComponent} from "../../components/rise-button/rise-button.component";
import {RiseTextInputComponent} from "../../components/rise-text-input/rise-text-input.component";
import {TranslateModule} from "@ngx-translate/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {RiseDropdownComponent} from "../../components/rise-dropdown/rise-dropdown.component";
import {Chart, registerables} from "chart.js";

@Component({
  selector: 'app-impacts-dialog',
  standalone: true,
  imports: [
    RiseButtonComponent,
    RiseTextInputComponent,
    TranslateModule,
    RiseDropdownComponent
  ],
  templateUrl: './impacts-dialog.component.html',
  styleUrl: './impacts-dialog.component.css'
})
export class ImpactsDialogComponent implements AfterViewInit{

  // For the three text inputs above the dropdown
  m_sInput1: string = '';
  m_sInput2: string = '';
  m_sInput3: string = '';

  // For the dropdown list
  m_asDropdownOptions: string[] = ['Option A', 'Option B', 'Option C']; // Populate with your actual options
  m_sSelectedOption: string = ''; // Initialize with a default or empty string

  // For the text inputs under each doughnut chart
  m_sDoughnut1ValueA: string = '';
  m_sDoughnut1ValueB: string = '';
  m_sDoughnut2ValueA: string = '';
  m_sDoughnut2ValueB: string = '';
  m_sDoughnut3ValueA: string = '';
  m_sDoughnut3ValueB: string = '';

  @ViewChild('doughnutChart1') doughnutChart1Ref!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutChart2') doughnutChart2Ref!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutChart3') doughnutChart3Ref!: ElementRef<HTMLCanvasElement>;

  // Chart instances
  chart1: Chart | undefined;
  chart2: Chart | undefined;
  chart3: Chart | undefined;


  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oDialogRef: MatDialogRef<ImpactsDialogComponent>,

  ) {
    Chart.register(...registerables); // Register all Chart.js components once
  }
  ngAfterViewInit(): void {
    // Charts must be created after the view has been initialized,
    // as the canvas elements need to be present in the DOM.
    this.createDoughnutChart(this.doughnutChart1Ref.nativeElement, 'Chart 1', [300, 50, 100], ['#FF6384', '#36A2EB', '#FFCE56']);
    this.createDoughnutChart(this.doughnutChart2Ref.nativeElement, 'Chart 2', [150, 200, 75], ['#4BC0C0', '#9966FF', '#FF9F40']);
    this.createDoughnutChart(this.doughnutChart3Ref.nativeElement, 'Chart 3', [100, 150, 250], ['#FFCD56', '#C9CBCF', '#E7E9ED']);
  }

  // Generic method to create a Doughnut Chart
  m_sAreaName: string="Area 1";
  m_sAreaId: string="123456789";
  private createDoughnutChart(canvasElement: HTMLCanvasElement, title: string, dataValues: number[], backgroundColors: string[]): Chart {
    const ctx = canvasElement.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context for canvas');
    }

    return new Chart(ctx, {
      type: 'doughnut', // Specify doughnut chart type
      data: {
        labels: ['Red', 'Blue', 'Yellow'], // Example labels, replace with your actual labels
        datasets: [{
          label: title,
          data: dataValues,
          backgroundColor: backgroundColors,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Allows you to control size with CSS
        plugins: {
          legend: {
            display: false // Hide legend if you want just the circle
          },
          title: {
            display: true,
            text: title // Display a title for each chart
          }
        }
      }
    });
  }



  onDismiss() {
    this.chart1?.destroy();
    this.chart2?.destroy();
    this.chart3?.destroy();
    this.m_oDialogRef.close();
  }
}
