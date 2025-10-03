import {Component, OnInit} from '@angular/core';
import {RiseDragAndDropComponent} from "../../components/rise-drag-and-drop/rise-drag-and-drop.component";
import {RiseButtonComponent} from "../../components/rise-button/rise-button.component";
import {ConstantsService} from "../../services/constants.service";
import {MatDialogRef} from "@angular/material/dialog";
import {open} from 'shapefile';
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-import-station-dialog',
  standalone: true,
  imports: [
    RiseDragAndDropComponent,
    RiseButtonComponent,
    TranslateModule
  ],
  templateUrl: './import-shape-file-station-dialog.component.html',
  styleUrl: './import-shape-file-station-dialog.component.css'
})
export class ImportShapeFileStationDialogComponent implements OnInit {
  m_oFile: any;



  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oDialogRef: MatDialogRef<ImportShapeFileStationDialogComponent>,
  ) {
  }

  ngOnInit(): void {

  }


  /*************** UPLOAD ***************/

  onFileSelected(event: any): void {
    const file = event.file; // Access the file from the emitted object

    if (file) {
      this.m_oFile = file;
    } else {
      console.error('No file selected.');
    }
  }


  onUploadFile() {
    // Ensure a file is selected
    if (!this.m_oFile) {
      console.error("No file selected.");
      return;
    }

    // Use the shapefile library to parse the shapefile
    const reader = new FileReader();
    reader.onload = (event: any) => {
      const arrayBuffer = event.target.result;

      // Using shapefile to parse
      open(arrayBuffer)
        .then(source => source.read()
          .then((result) => {
            if (result.done) {
              return;
            }
            // Close the dialog and send the result back to the parent
            this.m_oDialogRef.close(result.value);
          })
        )
        .catch(error => {
          console.error('Error parsing shapefile:', error);
        });
    };

    reader.readAsArrayBuffer(this.m_oFile); // Read the file as an ArrayBuffer for parsing
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
