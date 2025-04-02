import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {RiseButtonComponent} from "../../components/rise-button/rise-button.component";
import {RiseTextInputComponent} from "../../components/rise-text-input/rise-text-input.component";
import {RiseTextareaInputComponent} from "../../components/rise-textarea-input/rise-textarea-input.component";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {NgIf} from "@angular/common";
import {NotificationsDialogsService} from "../../services/notifications-dialogs.service";
import {JsonEditorService} from "../../services/json-editor.service";

@Component({
  selector: 'app-lat-lon-dialog',
  standalone: true,
  imports: [
    RiseButtonComponent,
    RiseTextInputComponent,
    RiseTextareaInputComponent,
    TranslateModule,
    NgIf
  ],
  templateUrl: './manual-bounding-box.component.html',
  styleUrl: './manual-bounding-box.component.css'
})
export class ManualBoundingBoxComponent implements OnInit{


  //todo create rise number input component
  m_sSampleJson = {
    "northEast": {
      "lat": 44.46924732175861,
      "lng": 9.058227539062502
    },
    "southWest": {
      "lat": 44.37852536073157,
      "lng": 8.721771240234377
    }
  }

  m_sJSONParam = '{}';
  @ViewChild('editor') m_oEditorRef!: ElementRef;
  m_oBBox = {
    north: "",
    south: "",
    east: "",
    west: ""
  }
  m_bShowJSON: boolean=false;


  constructor(
    private m_oDialogRef: MatDialogRef<ManualBoundingBoxComponent>,
    private m_oTranslate:TranslateService,
    private m_oNotificationDisplayService:NotificationsDialogsService,
    private m_oJsonEditorService: JsonEditorService,
  ) {
  }

  ngOnInit(){
    // this.showJsonParams()
  }
  submit() {
    this.m_oDialogRef.close(this.m_oBBox);
  }
  onDismiss() {
    this.m_oDialogRef.close(null);
  }

  toggleShowJSON() {
    this.m_bShowJSON = !this.m_bShowJSON

    if (this.m_bShowJSON === true) {
      this.showJsonParams()
    }
  }

  showJsonParams() {
    this.m_oJsonEditorService.setEditor(this.m_oEditorRef);
    this.m_oJsonEditorService.initEditor()
    this.m_oJsonEditorService.setText(this.m_sJSONParam);
  }

  getJsonInput() {
    this.m_sJSONParam = this.m_oJsonEditorService.getValue();

    try {
      let parsedJson = JSON.parse(this.m_sJSONParam);
      if (parsedJson.northEast && parsedJson.southWest) {
        this.m_oBBox.north = parsedJson.northEast.lat
        this.m_oBBox.east = parsedJson.northEast.lng
        this.m_oBBox.south = parsedJson.southWest.lat
        this.m_oBBox.west = parsedJson.southWest.lng
      }
    } catch (error){
      console.error(error)
    }
  }

  openInfoDialog() {
    let sMsg = this.m_oTranslate.instant("MANUAL_BBOX.DIALOG_MANUAL_INSERT_BBOX_INFO");
    let sExampleJson = `<pre id='json'>${JSON.stringify(this.m_sSampleJson, null, 2)}</pre>`
    this.m_oNotificationDisplayService.openInfoDialog(sMsg + sExampleJson, 'alert', '')
  }

  checkJSON() {
    let sErrorMsg = this.m_oTranslate.instant("MANUAL_BBOX.DIALOG_FORMAT_JSON_ERROR");
    let sErrorHeader = this.m_oTranslate.instant("MANUAL_BBOX.KEY_PHRASES.ERROR");
    try {
      let oParsedJson = JSON.parse(this.m_sJSONParam);
      let sPrettyPrint = JSON.stringify(oParsedJson, null, 2);

      this.m_oJsonEditorService.setText(sPrettyPrint)

    } catch {
      this.m_oNotificationDisplayService.openInfoDialog(sErrorMsg, 'danger', sErrorHeader)
    }
  }
}
