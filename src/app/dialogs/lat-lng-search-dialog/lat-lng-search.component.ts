import {Component} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {RiseButtonComponent} from "../../components/rise-button/rise-button.component";
import {RiseTextInputComponent} from "../../components/rise-text-input/rise-text-input.component";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-lat-lng-search-dialog',
  standalone: true,
  imports: [
    RiseButtonComponent,
    RiseTextInputComponent,
    TranslateModule
  ],
  templateUrl: './lat-lng-search.component.html',
  styleUrl: './lat-lng-search.component.css'
})
export class LatLngSearchComponent {

  m_oCoordinates = {
    latitude: "",
    longitude: ""
  }

  constructor(
    private m_oDialogRef: MatDialogRef<LatLngSearchComponent>
  ) {
  }

  submit() {
    this.m_oDialogRef.close(this.m_oCoordinates);
  }

  onDismiss() {
    this.m_oDialogRef.close(null);
  }
}
