import {AfterViewInit, Component, EventEmitter, OnInit, Output,} from '@angular/core';
import {NgIf} from '@angular/common';
import {Router} from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {geojsonToWKT} from '@terraformer/wkt';

import {MatDialog} from '@angular/material/dialog';

import {RiseButtonComponent} from '../../components/rise-button/rise-button.component';
import {RiseCheckboxComponent} from '../../components/rise-checkbox/rise-checkbox.component';
// import { RiseCrudTableComponent } from '../../components/rise-crud-table/rise-crud-table.component';
import {RiseMapComponent} from '../../components/rise-map/rise-map.component';
import {RiseTextareaInputComponent} from '../../components/rise-textarea-input/rise-textarea-input.component';
import {RiseTextInputComponent} from '../../components/rise-text-input/rise-text-input.component';
// import { RiseToolbarComponent } from '../../components/rise-toolbar/rise-toolbar.component';
import {AreaService} from '../../services/api/area.service';
import {MapService} from '../../services/map.service';
import {NotificationsDialogsService} from '../../services/notifications-dialogs.service';
import {PluginService} from '../../services/api/plugin.service';

import {AreaViewModel} from '../../models/AreaViewModel';
import {UserOfAreaViewModel} from '../../models/UserOfAreaViewModel';

import FadeoutUtils from '../../shared/utilities/FadeoutUtils';
import {ConstantsService} from "../../services/constants.service";
import {UserService} from "../../services/api/user.service";
import {environment} from "../../../environments/environments";

@Component({
  selector: 'app-create-area-of-operation',
  standalone: true,
  providers: [],
  imports: [
    RiseButtonComponent,
    RiseCheckboxComponent,
    RiseMapComponent,
    RiseTextareaInputComponent,
    RiseTextInputComponent,
    TranslateModule,
    NgIf,
  ],
  templateUrl: './create-area-of-operation.component.html',
  styleUrl: './create-area-of-operation.component.css',
})
export class CreateAreaOfOperationComponent implements OnInit, AfterViewInit {
  /**
   * UC_40 - Add Area of Operations
   */
  @Output() m_oExitPage: EventEmitter<boolean> = new EventEmitter<boolean>(
    null
  );

  m_asPlugins: { label: string; value: string }[] = [];

  /**
   * Users selected to add to the area of interest
   */
  m_aoUserData = [];

  /**
   * Input model for form + validations
   */
  m_oAreaOfOperation: AreaViewModel = {} as AreaViewModel;

  /**
   * User's existing Areas of Operations
   */
  m_aoAreasOfOperations: AreaViewModel[];

  /**
   * Field users to track
   */
  m_aoFieldUsers: UserOfAreaViewModel[] = [];

  /**
   * Selected Plugins
   */
  m_asPluginsSelected: string[] = [];

  /**
   * Area of interest map input
   */
  m_oAreaInfo = {};

  /**
   * Error strings for validator output
   */
  m_sAreaOfOperationNameError: string = '';
  m_sAreaOfOperationDescriptionError: string = '';
  m_sPluginError: string = '';

  m_bValidationActive = false;
  m_bDescriptionIsValid: boolean = true;
  m_bNameIsValid: boolean = true;
  m_bPluginsAreValid: boolean = true;
  m_sOrganizationId: string;

  constructor(
    private m_oAreaOfOperationService: AreaService,
    private m_oDialog: MatDialog,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oPluginService: PluginService,
    private m_oRouter: Router,
    private m_oTranslate: TranslateService,
    private m_oMapService: MapService,
    private m_oConstantService: ConstantsService,
    private m_oUserService: UserService
  ) {
  }

  ngAfterViewInit() {
  }

  ngOnInit() {
    //used for checking overlapping area
    this.getOrganizationId();
    // Optional: Ensure the component reference is available
    //todo get users that belong to current user org either by direct call or get all users and match with current user org id
    this.m_oPluginService.getPluginsList().subscribe({
      next: (aoResponse) => {
        for (const aoResponseElement of aoResponse) {
          if (
            aoResponseElement != '' &&
            aoResponseElement.name &&
            aoResponseElement.id
          ) {
            this.m_asPlugins.push({
              label: aoResponseElement.name,
              value: aoResponseElement.id,
            });
          }
        }
      },
    });
    this.m_oAreaOfOperationService.getAreaList().subscribe({
      next: (aoResponse) => {
        this.m_aoAreasOfOperations = aoResponse;
      },
    });
  }

  onSelectionChange(selectedValues: any[]) {
    this.m_asPluginsSelected = selectedValues;
    this.m_oAreaOfOperation.plugins = this.m_asPluginsSelected;
  }

  getOrganizationId() {
    let oUser = this.m_oConstantService.getUser();
    if (!oUser) {
      this.m_oUserService.getUser().subscribe({
        next: (oResponse) => {
          this.m_sOrganizationId = oResponse.organizationId;
        }
      })
    } else {
      this.m_sOrganizationId = oUser.organizationId;
    }
    return null;
  }

  /**
   * Handles input changes to RISE map
   * UC: HQ Operator can insert the Area of interest using:
   *  - manually insert the lat lon coordinates (North East South West) of the area
   *  - draw a rectangle directly on the map
   *  - upload a shape file to define/filter the area of operations
   *  - click on a point on the map and RISE will draw around the minimum area
   * @param shapeInfo
   */
  onMapInputChange(shapeInfo: any) {
    if (shapeInfo) {
      if (shapeInfo.type === 'circle') {
        // Store circle information as before
        this.m_oAreaInfo = {
          type: 'circle',
          center: {
            lat: shapeInfo.center.lat,
            lng: shapeInfo.center.lng,
          },
          radius: shapeInfo.radius,
          area: shapeInfo.area,
        };
        this.m_oAreaOfOperation.markerCoordinates =
          'POINT(' + shapeInfo.center.lng + ' ' + shapeInfo.center.lat + ')';
        // Convert circle to WKT (approximated as a polygon with 64 points)
        this.m_oAreaOfOperation.bbox = this.m_oMapService.convertCircleToWKT(
          shapeInfo.center,
          shapeInfo.radius
        );
      } else if (shapeInfo.type === 'polygon') {
        // Store polygon information as before
        this.m_oAreaInfo = {
          type: 'polygon',
          points: shapeInfo.points,
          area: shapeInfo.area,
          geoJson: shapeInfo.geoJson,
          center: shapeInfo.center,
        };
        // Convert polygon to WKT
        this.m_oAreaOfOperation.bbox = geojsonToWKT(shapeInfo.geoJson);
        this.m_oAreaOfOperation.markerCoordinates =
          'POINT(' + shapeInfo.center.lng + ' ' + shapeInfo.center.lat + ')';
      }
    }
  }

  executeAreaOfOperationSaving() {
    this.m_bValidationActive = true;
    if (this.validateAOI()) {
      this.checkOverlappingAreas(this.m_oAreaOfOperation)

    }
  }

  exitCreatingAreaOfOperation() {
    this.resetAreaOfOperationForm();
    this.m_oExitPage.emit(false);
  }

  /********* Input form validations and handlers *********/
  /**
   * Enable the area of interest submission button
   * @returns boolean
   */
  enableAOISubmit(): boolean {
    if (!this.m_oAreaOfOperation.name) {
      return false;
    }
    if (this.m_asPluginsSelected.length < 1) {
      return false;
    }
    if (!this.m_oAreaOfOperation.bbox) {
      return false;
    }
    return true;
  }

  /**
   * Ensure the user has entered a valid name for their area
   * @returns boolean
   */
  validateAOIName(): boolean {
    if (!this.m_bValidationActive) return true;

    if (
      FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oAreaOfOperation.name) ||
      this.m_oAreaOfOperation.name.length < 6
    ) {
      this.m_sAreaOfOperationNameError =
        'Please enter a valid name of at least 6 characters.';
      this.m_bNameIsValid = false;
      return false;
    }

    this.m_sAreaOfOperationNameError = ''; // Clear error when valid
    this.m_bNameIsValid = true;
    return true;
  }

  /**
   * Ensure the user has entered a valid description for their area
   * @returns boolean
   */
  validateAOIDescription(): boolean {
    if (
      FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oAreaOfOperation.description)
    ) {
      this.m_sAreaOfOperationDescriptionError =
        'Please provide a description for your area of operations';
      this.m_bDescriptionIsValid = false;
      return false;
    }
    this.m_sAreaOfOperationDescriptionError = ''; // Clear error when valid
    this.m_bDescriptionIsValid = true;
    return true;
  }

  private saveAreaOfOperation() {
    //TODO until the daemon is ready
    if(environment.isTestEnvironment){
      this.m_oAreaOfOperation.plugins=[]
    }
    this.m_oAreaOfOperationService
      .addArea(this.m_oAreaOfOperation)
      .subscribe({
        next: (oResponse) => {
          //todo send confirmation to HQ operator
          this.m_oNotificationService.openSnackBar(
            'Your are has been added successfully',
            'Success',
            'success'
          );
          this.exitCreatingAreaOfOperation();
        },
        error: (oError) => {
          // Here handle no valid subscription
          if (
            oError.error.errorStringCodes[0] === 'ERROR_API_NO_VALID_SUBSCRIPTION'
          ) {
            //open dialog to invite user to buy new subscription
            this.inviteUserToBuyNewSubscription();
          }
        },
      });
  }

  /**
   * UC: RISE verifies the subscription status of the organization
   * If the Organization does not have a valid subscription:
   * RISE invites the user to buy a New Subscription (UC_095)
   */
  private inviteUserToBuyNewSubscription(): void {
    let sMessage =
      'Your subscription is invalid.<br> Would you like to purchase a new one?';
    this.m_oNotificationService
      .openConfirmationDialog(sMessage, 'alert')
      .subscribe((oResult) => {
        if (oResult) {
          //go to subscription page
          //todo this is a bad solution
          this.m_oRouter
            .navigateByUrl('/', {skipLocationChange: true})
            .then(() => {
              this.m_oRouter.navigateByUrl('/account', {
                state: {m_sActiveOutlet: 'subscriptions'},
              });
            });
        }
      });
  }

  /**
   * Ensure all the inputs are valid && check for overlapping area or if the name of the area exists already
   * @returns boolean
   */
  private validateAOI(): boolean {
    return !(!this.validateAOIName() ||
      !this.validateAOIDescription() ||
      !this.validateAOIPlugins() ||
      !this.validateAreaInfo());
  }

  /**
   * Ensure the user has selected at least one plugin
   * @returns boolean
   */
  private validateAOIPlugins(): boolean {
    if (
      !this.m_oAreaOfOperation.plugins ||
      this.m_oAreaOfOperation.plugins.length < 1
    ) {
      this.m_sPluginError = 'Please select at least one plugin from the list.';
      return false;
    }
    return true;
  }

  /**
   * Ensure the user has inputted Area information (i.e., Bbox)
   * @returns boolean
   */
  private validateAreaInfo(): boolean {
    return this.m_oAreaInfo !== null;
  }

  /**
   * Reset form inputs
   * @returns
   */
  private resetAreaOfOperationForm(): void {
    // Reset the name and description
    this.m_oAreaOfOperation = {
      bbox: '',
      description: '',
      name: '',
      plugins: [],
      markerCoordinates: '',
    };

    // Reset the map area
    this.m_oAreaInfo = {};

    // Reset the selected events (checkboxes)
    this.m_asPluginsSelected = [];

    // Reset the users in the table
    this.m_aoFieldUsers = [];
    this.m_aoUserData = [];
    this.m_oMapService.clearPreviousDrawings(null);
    // this.m_oRiseSelectAreaComponent.clearPreviousDrawings();
  }

  /********** Area of Interest - MAP INPUT VALIDATIONS **********/
  /**
   * Check if the proposed area overlaps with an existing area of the user
   * UC: If the selected area overlaps or have the same name of an existing one
   * @param m_oAreaOfOperation
   * @returns
   */
  private checkOverlappingAreas(m_oAreaOfOperation: AreaViewModel) {

    // RISE communicates to the HQ Operator that there is already an overlapping area that is up and running
    // RISE ask confirmation to the HQ Operator if we really wants to proceed;
    // If the user cancels the operation, RISE clears the form .
    if (this.m_sOrganizationId) {
      this.m_oAreaOfOperationService.getOverlappingAreas(this.m_sOrganizationId, m_oAreaOfOperation).subscribe(
        {
          next: (oResponse) => {

            /*here we have to check for list of the over lapping area
              , if it is empty, we are good to go but if it has one or more , we have to tell the user and then he decides ,
              if he cancels we clear form if he accepts we add it
             */
            if(oResponse.length<1){
              this.saveAreaOfOperation();
            }else{
              let sErrorMsg: string = this.m_oTranslate.instant(
              'AREA_OF_OPERATIONS.CONFIRM_SAME_AREA'
            );
            this.m_oNotificationService.openConfirmationDialog(
              sErrorMsg, 'danger'
            ).subscribe((bResult=>{
              if(bResult){
                this.saveAreaOfOperation();
              }
            }))
            }

          }, error: (oError) => {
            //here it either an error or there is an area with the same name
            if (
              oError?.error?.errorStringCodes[0] === 'ERROR_API_AREA_NAME_ALREADY_EXISTS'
            ) {
              let sErrorMsg: string = this.m_oTranslate.instant(
                'AREA_OF_OPERATIONS.CONFIRM_SAME_NAME'
              );
              this.m_oNotificationService.openConfirmationDialog(
                sErrorMsg, 'danger'
              ).subscribe((bResult => {
                if (bResult) {
                  this.saveAreaOfOperation();
                }
              }))


            } else {
              console.error(oError)
            }
          }
        }
      )
    }

  }

}
