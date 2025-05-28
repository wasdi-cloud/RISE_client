import {AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import {RiseTextInputComponent} from "../../components/rise-text-input/rise-text-input.component";
import {TranslateModule} from "@ngx-translate/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {RiseDropdownComponent} from "../../components/rise-dropdown/rise-dropdown.component";
import {Chart, registerables} from "chart.js";
import { WidgetService } from "../../services/api/widget.service";
import { WidgetInfoViewModel } from '../../models/WidgetInfoViewModel';

@Component({
  selector: 'app-impacts-dialog',
  standalone: true,
  imports: [
    CommonModule,
    RiseTextInputComponent,
    TranslateModule,
    RiseDropdownComponent
  ],
  templateUrl: './impacts-dialog.component.html',
  styleUrl: './impacts-dialog.component.css'
})

export class ImpactsDialogComponent implements OnInit, AfterViewInit {

  /**
   * Selected widget information.
   */
  m_oSelectedWidget: WidgetInfoViewModel | undefined;

  /**
   * Crops Total Area
   */
  m_sCropsTotArea: string = '';

  /**
   * Crops Affected Area
   */
  m_sCropsAffectedArea: string = '';

  /**
   * Grassland Total Area
   */
  m_sGrassTotArea: string = '';

  /**
   * Grassland Affected Area
   */
  m_sGrassAffectedArea: string = '';

  /**
   * Built up Total Area
   */
  m_sBuiltTotArea: string = '';

  /**
   * Built up Affected Area
   */
  m_sBuiltAffectedArea: string = '';

  // For the dropdown list
  m_aoDropdownOptions: any[] = []; // Populate with your actual options

  /**
   * This variable holds the selected option from the dropdown.
   */
  m_oSelectedOption: any = ''; 

  @ViewChild('doughnutChart1') m_oChartCropsRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutChart2') m_oChartGrassRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutChart3') m_ChartBuiltUpRef!: ElementRef<HTMLCanvasElement>;

  /**
   * Crops chart
   */
  m_oCropsChart: Chart | undefined;
  /**
   * Grassland chart
   */
  m_oGrassLandChart: Chart | undefined;
  /**
   * Built up chart
   */
  m_oBuiltUpChart: Chart | undefined;

  /**
   * Array of WidgetInfoViewModel objects containing the impacts data.
   */
  m_aoWidgetInfoViewModel: WidgetInfoViewModel[] = [];

  /**
   * Name of the area
   */
  m_sAreaName: string="";

  /**
   * Reference date user to find the impacts.
   */
  m_sRefDate: string="";

  /**
   * Flag to indicate if impacts are available for the selected area and date.
   */
  m_bImpactsAvailable: boolean = true;


  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oDialogRef: MatDialogRef<ImpactsDialogComponent>,
    private m_oWidgetService: WidgetService,
    private m_oTranslateService: TranslateService
  ) {
    // Register all Chart.js components once
    Chart.register(...registerables); 
  }

  /**
   * Initializes the component.
   * 
   * We search the impacts for today's date first, and if not available, we search for the previous day.
   */
  ngOnInit(): void {
    // Format the actual date
    const sFormattedDate = this.formatDateToYMD(this.m_oData.selectedDate);
    // And the day before
    const sFormattedPreviousDate = this.formatDateToYMDPreviousDay(this.m_oData.selectedDate);

    // Assign area name
    this.m_sAreaName = this.m_oData.areaName;

    // And clean the date for now
    this.m_sRefDate = "";

    // Call the API
    this.m_oWidgetService.getDayImpacts(this.m_oData.areaId, sFormattedDate).subscribe({
      next: (data) => {
        // Do we have data for today?
        if (data.length > 0) {
          // Yes, we will use it
          this.m_aoWidgetInfoViewModel = data;
          this.m_sRefDate = sFormattedDate;
          this.initializeAvailableImpacts();
        }
        else {
          // Maybe we have data for the previous day?
          this.m_oWidgetService.getDayImpacts(this.m_oData.areaId, sFormattedPreviousDate).subscribe({
            next: (previousData) => { 
              // Great, we have data for the previous day
              this.m_aoWidgetInfoViewModel = previousData;
              this.m_sRefDate = sFormattedPreviousDate;
              this.initializeAvailableImpacts();
            },
            error: (error) => {
              console.error('Error fetching previous day impacts:', error);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error fetching day impacts:', error);
      }
    });
  }  

  /**
   * Initializes the available impacts based on the widget information.
   */
  initializeAvailableImpacts(): void {

    // Here we need to populate the dropdown options based on the available widgets.
    // Can be only bare soil, urban or both.
    this.m_aoDropdownOptions =  [];


    let sBareSoilMap = this.m_oTranslateService.instant('IMPACTS_DIALOG.BARESOIL');
    let sUrbanMap = this.m_oTranslateService.instant('IMPACTS_DIALOG.URBAN');
    let sMergedMap = this.m_oTranslateService.instant('IMPACTS_DIALOG.MERGED');

    // Do we have at least one?
    if (this.m_aoWidgetInfoViewModel.length > 0) {

      // For all:
      for (const oWidget of this.m_aoWidgetInfoViewModel) {

        // Is it a bare soil?
        if (oWidget.widget === 'impacts_baresoil') {

          const oOption = {
              id: 1,
              name: sBareSoilMap
          };

          this.m_aoDropdownOptions.push(oOption);
        }
        // Or an Urban one?
        else if (oWidget.widget === 'impacts_urban') {
          const oOption = {
              id: 2,
              name: sUrbanMap
          };          
          this.m_aoDropdownOptions.push(oOption);
        }
      }
    }

    // If we have both, we can add the combined option
    if (this.m_aoDropdownOptions.length == 2) {
      const oOption = {
          id: 3,
          name: sMergedMap
      };          
      this.m_aoDropdownOptions.push(oOption);
    }

    // If we have no options, we set the impacts available to false
    if (this.m_aoDropdownOptions.length == 0) {
      this.m_bImpactsAvailable = false;
    }
    else {
      this.m_bImpactsAvailable = true;
    }
  }


  /**
   * Returns the WidgetInfoViewModel object based on the selected index from the dropdown.
   * 
   * @param iIndex The index of the selected option in the dropdown.
   * @returns The WidgetInfoViewModel object or undefined if not found.
   */
  getWidgetInfoByComboIndex(iIndex: number): WidgetInfoViewModel | undefined {

    for (const oWidget of this.m_aoWidgetInfoViewModel) {

      if (oWidget.widget === 'impacts_baresoil' && iIndex === 1) {
        // Bare soil widget
        return oWidget;
      }
      else if (oWidget.widget === 'impacts_urban' && iIndex === 2) {
        // Urban widget
        return oWidget;
      }
    }

    if (iIndex === 3) {

      // If we have both, we combine the two widgets
      if (this.m_aoWidgetInfoViewModel.length >= 2) {

        // Create the combined Widget
        let oCombinedWidget = new WidgetInfoViewModel();
        oCombinedWidget.id = 'impacts_combined';

        // Get the first and second widget
        let oFirst = this.m_aoWidgetInfoViewModel[0];
        let oSecond = this.m_aoWidgetInfoViewModel[1];

        // Initialie the payload with the first widget's payload
        //oCombinedWidget.payload = oFirst.payload;

        // Sum roads, exposures, and population counts
        oCombinedWidget.payload["roadsCount"] = oFirst.payload["roadsCount"] + oSecond.payload["roadsCount"];
        oCombinedWidget.payload["exposuresCount"] = oFirst.payload["exposuresCount"] + oSecond.payload["exposuresCount"];
        oCombinedWidget.payload["populationCount"] = oFirst.payload["populationCount"] + oSecond.payload["populationCount"];

        // Initialize affected land use with default values
        oCombinedWidget.payload["affectedLandUse"] = {}
        oCombinedWidget.payload["affectedLandUse"]['crops'] = {};
        oCombinedWidget.payload["affectedLandUse"]['grass'] = {};
        oCombinedWidget.payload["affectedLandUse"]['built_up'] = {};

        oCombinedWidget.payload["affectedLandUse"]['crops']['square_meters'] = "N.A.";
        oCombinedWidget.payload["affectedLandUse"]['crops']['tot_area'] = "N.A.";
        oCombinedWidget.payload["affectedLandUse"]['crops']['percentage'] = "N.A.";

        oCombinedWidget.payload["affectedLandUse"]['grass']['square_meters'] = "N.A.";
        oCombinedWidget.payload["affectedLandUse"]['grass']['tot_area'] = "N.A.";
        oCombinedWidget.payload["affectedLandUse"]['grass']['percentage'] = "N.A.";

        oCombinedWidget.payload["affectedLandUse"]['built_up']['square_meters'] = "N.A.";
        oCombinedWidget.payload["affectedLandUse"]['built_up']['tot_area'] = "N.A.";
        oCombinedWidget.payload["affectedLandUse"]['built_up']['percentage'] = "N.A.";

        // Check crops:
        if (oFirst.payload['affectedLandUse'] && oFirst.payload['affectedLandUse']['crops'] && oSecond.payload['affectedLandUse'] && oSecond.payload['affectedLandUse']['crops']) {
          // Both available, sum them
          oCombinedWidget.payload["affectedLandUse"]['crops']['square_meters'] = oFirst.payload['affectedLandUse']['crops']['square_meters'] + oSecond.payload['affectedLandUse']['crops']['square_meters'];
          oCombinedWidget.payload["affectedLandUse"]['crops']['tot_area'] = oFirst.payload['affectedLandUse']['crops']['tot_area'] + oSecond.payload['affectedLandUse']['crops']['tot_area'];
        }
        else if (oFirst.payload['affectedLandUse'] && oFirst.payload['affectedLandUse']['crops']) {
          // Only first available
          oCombinedWidget.payload["affectedLandUse"]['crops']['square_meters'] = oFirst.payload['affectedLandUse']['crops']['square_meters'];
          oCombinedWidget.payload["affectedLandUse"]['crops']['tot_area'] = oFirst.payload['affectedLandUse']['crops']['tot_area'];
        }
        else if (oSecond.payload['affectedLandUse'] && oSecond.payload['affectedLandUse']['crops']) {
          // Only second available
          oCombinedWidget.payload["affectedLandUse"]['crops']['square_meters'] = oSecond.payload['affectedLandUse']['crops']['square_meters'];
          oCombinedWidget.payload["affectedLandUse"]['crops']['tot_area'] = oSecond.payload['affectedLandUse']['crops']['tot_area'];
        }
        
        // Compute the percentage for crops
        if (oCombinedWidget.payload["affectedLandUse"]['crops']['tot_area']!="N.A.") {
          if (oCombinedWidget.payload["affectedLandUse"]['crops']['tot_area']> 0) {
            oCombinedWidget.payload["affectedLandUse"]['crops']['percentage'] = oCombinedWidget.payload["affectedLandUse"]['crops']['square_meters']/ oCombinedWidget.payload["affectedLandUse"]['crops']['tot_area'];
          }
          else {
            oCombinedWidget.payload["affectedLandUse"]['crops']['percentage'] = 0;
          }
        }


        // Check grass:
        if (oFirst.payload['affectedLandUse'] && oFirst.payload['affectedLandUse']['grass'] && oSecond.payload['affectedLandUse'] && oSecond.payload['affectedLandUse']['grass']) {
          // Both available, sum them
          oCombinedWidget.payload["affectedLandUse"]['grass']['square_meters'] = oFirst.payload['affectedLandUse']['grass']['square_meters'] + oSecond.payload['affectedLandUse']['grass']['square_meters'];
          oCombinedWidget.payload["affectedLandUse"]['grass']['tot_area'] = oFirst.payload['affectedLandUse']['grass']['tot_area'] + oSecond.payload['affectedLandUse']['grass']['tot_area'];
        }
        else if (oFirst.payload['affectedLandUse'] && oFirst.payload['affectedLandUse']['grass']) {
          // Only first available
          oCombinedWidget.payload["affectedLandUse"]['grass']['square_meters'] = oFirst.payload['affectedLandUse']['grass']['square_meters'];
          oCombinedWidget.payload["affectedLandUse"]['grass']['tot_area'] = oFirst.payload['affectedLandUse']['grass']['tot_area'];
        }
        else if (oSecond.payload['affectedLandUse'] && oSecond.payload['affectedLandUse']['grass']) {
          // Only second available
          oCombinedWidget.payload["affectedLandUse"]['grass']['square_meters'] = oSecond.payload['affectedLandUse']['grass']['square_meters'];
          oCombinedWidget.payload["affectedLandUse"]['grass']['tot_area'] = oSecond.payload['affectedLandUse']['grass']['tot_area'];
        }
        
        // Compute the percentage for grass
        if (oCombinedWidget.payload["affectedLandUse"]['grass']['tot_area']!="N.A.") {
          if (oCombinedWidget.payload["affectedLandUse"]['grass']['tot_area']> 0) {
            oCombinedWidget.payload["affectedLandUse"]['grass']['percentage'] = oCombinedWidget.payload["affectedLandUse"]['grass']['square_meters']/ oCombinedWidget.payload["affectedLandUse"]['grass']['tot_area'];
          }
          else {
            oCombinedWidget.payload["affectedLandUse"]['grass']['percentage'] = 0;
          }
        }        


        // Check built up:
        if (oFirst.payload['affectedLandUse'] && oFirst.payload['affectedLandUse']['built_up'] && oSecond.payload['affectedLandUse'] && oSecond.payload['affectedLandUse']['built_up']) {
          // Both available, sum them
          oCombinedWidget.payload["affectedLandUse"]['built_up']['square_meters'] = oFirst.payload['affectedLandUse']['built_up']['square_meters'] + oSecond.payload['affectedLandUse']['built_up']['square_meters'];
          oCombinedWidget.payload["affectedLandUse"]['built_up']['tot_area'] = oFirst.payload['affectedLandUse']['built_up']['tot_area'] + oSecond.payload['affectedLandUse']['grasbuilt_ups']['tot_area'];
        }
        else if (oFirst.payload['affectedLandUse'] && oFirst.payload['affectedLandUse']['built_up']) {
          // Only first available
          oCombinedWidget.payload["affectedLandUse"]['built_up']['square_meters'] = oFirst.payload['affectedLandUse']['built_up']['square_meters'];
          oCombinedWidget.payload["affectedLandUse"]['built_up']['tot_area'] = oFirst.payload['affectedLandUse']['built_up']['tot_area'];
        }
        else if (oSecond.payload['affectedLandUse'] && oSecond.payload['affectedLandUse']['built_up']) {
          // Only second available
          oCombinedWidget.payload["affectedLandUse"]['built_up']['square_meters'] = oSecond.payload['affectedLandUse']['built_up']['square_meters'];
          oCombinedWidget.payload["affectedLandUse"]['built_up']['tot_area'] = oSecond.payload['affectedLandUse']['built_up']['tot_area'];
        }
        
        // Compute the percentage for built up
        if (oCombinedWidget.payload["affectedLandUse"]['built_up']['tot_area']!="N.A.") {
          if (oCombinedWidget.payload["affectedLandUse"]['built_up']['tot_area']> 0) {
            oCombinedWidget.payload["affectedLandUse"]['built_up']['percentage'] = oCombinedWidget.payload["affectedLandUse"]['built_up']['square_meters']/ oCombinedWidget.payload["affectedLandUse"]['built_up']['tot_area'];
          }
          else {
            oCombinedWidget.payload["affectedLandUse"]['built_up']['percentage'] = 0;
          }
        }                
        return oCombinedWidget;
      }
    }

    // Return undefined if no match is found
    return undefined; 
  }  

  ngAfterViewInit(): void {

  }

  private createDoughnutChart(oCanvasElement: HTMLCanvasElement, sTitle: string, afDataValues: number[], asBackgroundColors: string[], asLabels: string[], oExistingChart?: Chart): Chart {
    const oContext = oCanvasElement.getContext('2d');
    if (!oContext) {
      throw new Error('Failed to get 2D context for canvas');
    }

    // Destroy previous chart instance if it exists
    if (oExistingChart) {
      oExistingChart.destroy();
    }    

    return new Chart(oContext, {
      type: 'doughnut', 
      data: {
        labels: asLabels,
        datasets: [{
          label: sTitle,
          data: afDataValues,
          backgroundColor: asBackgroundColors,
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
            text: sTitle // Display a title for each chart
          }
        }
      }
    });
  }


  /**
   * Here we handle the selection change of the dropdown.
   * @param oEvent 
   */
  onDropdownSelectionChange(oEvent: any): void {
    
    this.m_oSelectedOption = oEvent;

    this.m_oSelectedWidget = this.getWidgetInfoByComboIndex(this.m_oSelectedOption.value.id);

    if (this.m_oSelectedWidget === undefined) {
      this.m_bImpactsAvailable = false;
      return;
    }

    let sCropsLabel = this.m_oTranslateService.instant('IMPACTS_DIALOG.CROPS');
    let sGrassLabel = this.m_oTranslateService.instant('IMPACTS_DIALOG.GRASSLAND');
    let sBuiltLabel = this.m_oTranslateService.instant('IMPACTS_DIALOG.BUILT_UP');

    let sAffected = this.m_oTranslateService.instant('IMPACTS_DIALOG.AFFECTED');
    let sNotAffected = this.m_oTranslateService.instant('IMPACTS_DIALOG.NOT_AFFECTED');

    let fCropsPerc = 0;
    let fGrassPerc = 0;
    let fBuiltPerc = 0;
    this.m_sCropsTotArea = "N.A.";
    this.m_sCropsAffectedArea = "N.A.";
    this.m_sGrassTotArea = "N.A.";
    this.m_sGrassAffectedArea = "N.A.";
    this.m_sBuiltTotArea = "N.A.";
    this.m_sBuiltAffectedArea = "N.A.";

    if (this.m_oSelectedWidget.payload['affectedLandUse']) {
      if (this.m_oSelectedWidget.payload['affectedLandUse']['crops']) {
        fCropsPerc = this.m_oSelectedWidget.payload['affectedLandUse']['crops']['percentage'];
        this.m_sCropsTotArea = this.formatSquareMetersToKm(this.m_oSelectedWidget.payload['affectedLandUse']['crops']['tot_area']);
        this.m_sCropsAffectedArea = this.formatSquareMetersToKm(this.m_oSelectedWidget.payload['affectedLandUse']['crops']['square_meters']);
      }
      
      if (this.m_oSelectedWidget.payload['affectedLandUse']['grass']) {
        fGrassPerc = this.m_oSelectedWidget.payload['affectedLandUse']['grass']['percentage'];
        this.m_sGrassTotArea = this.formatSquareMetersToKm(this.m_oSelectedWidget.payload['affectedLandUse']['grass']['tot_area']);
        this.m_sGrassAffectedArea = this.formatSquareMetersToKm(this.m_oSelectedWidget.payload['affectedLandUse']['grass']['square_meters']);        
      }
      
      if (this.m_oSelectedWidget.payload['affectedLandUse']['built_up']) {
        fBuiltPerc = this.m_oSelectedWidget.payload['affectedLandUse']['built_up']['percentage'];
        this.m_sBuiltTotArea = this.formatSquareMetersToKm(this.m_oSelectedWidget.payload['affectedLandUse']['built_up']['tot_area']);
        this.m_sBuiltAffectedArea = this.formatSquareMetersToKm(this.m_oSelectedWidget.payload['affectedLandUse']['built_up']['square_meters']);
      }
    }

    // Charts must be created after the view has been initialized,
    // as the canvas elements need to be present in the DOM.
    this.m_oCropsChart = this.createDoughnutChart(this.m_oChartCropsRef.nativeElement, sCropsLabel, [1.0-fCropsPerc, fCropsPerc], ['#4BC0C0', '#FF6384'], [sNotAffected, sAffected], this.m_oCropsChart);
    this.m_oGrassLandChart = this.createDoughnutChart(this.m_oChartGrassRef.nativeElement, sGrassLabel, [1.0-fGrassPerc, fGrassPerc], ['#4BC0C0', '#FF6384'], [sNotAffected, sAffected], this.m_oGrassLandChart);
    this.m_oBuiltUpChart = this.createDoughnutChart(this.m_ChartBuiltUpRef.nativeElement, sBuiltLabel, [1.0-fBuiltPerc, fBuiltPerc], ['#4BC0C0', '#FF6384'], [sNotAffected, sAffected], this.m_oBuiltUpChart);

  }

  /**
   * Convert a timestamp to a formatted date string in YYYY-MM-DD format.
   * @param iTimestamp 
   * @returns 
   */
  private formatDateToYMD(iTimestamp: number): string {
    const oDate = new Date(iTimestamp);
    const sYear = oDate.getFullYear();
    const sMonth = String(oDate.getMonth() + 1).padStart(2, '0');
    const sDay = String(oDate.getDate()).padStart(2, '0');
    return `${sYear}-${sMonth}-${sDay}`;
  }

  /**
   * * Convert a timestamp to a formatted date string in YYYY-MM-DD format for the previous day.
   * @param iTimestamp 
   * @returns 
   */
  private formatDateToYMDPreviousDay(iTimestamp: number): string {
    const oDate = new Date(iTimestamp);
    oDate.setDate(oDate.getDate() - 1); // Subtract one day
    const sYear = oDate.getFullYear();
    const sMonth = String(oDate.getMonth() + 1).padStart(2, '0');
    const sDay = String(oDate.getDate()).padStart(2, '0');
    return `${sYear}-${sMonth}-${sDay}`;
  }

  onDismiss() {
    this.m_oCropsChart?.destroy();
    this.m_oGrassLandChart?.destroy();
    this.m_oBuiltUpChart?.destroy();
    this.m_oDialogRef.close();
  }

  formatSquareMetersToKm(fSquareMeters: number): string {
    if (!fSquareMeters) {
      return 'N.A.';
    }

    if (fSquareMeters < 1000000) {
      return `${(fSquareMeters / 1000).toFixed(2)} km²`;
    } else {
      return `${(fSquareMeters / 1000000).toFixed(2)} km²`;
    }
  }
}
