import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DragAndDropDirective} from "./drag-and-drop.directive";

@Component({
  selector: 'rise-drag-and-drop',
  standalone: true,
  imports: [
    DragAndDropDirective
  ],
  templateUrl: './rise-drag-and-drop.component.html',
  styleUrl: './rise-drag-and-drop.component.css'
})
export class RiseDragAndDropComponent {
  @Output() m_oSelectedFileOutput = new EventEmitter();
  @Input() m_sPrompt?: string = "Drop file"
  @Input() m_sFormDataType: string = 'file'
  m_sSelectedFileName: string = '';
  m_oSelectedFile: any;

  /**
   * Handle Files selected by the browse feature
   * @param oInput
   */
  onFileSelect(oInput: any) {
    let oInputFile

    if (oInput['0']) {
      oInputFile = oInput['0'];

    } else if (oInput.files['0']) {
      oInputFile = oInput.files['0']
    }
    this.m_sSelectedFileName = oInputFile.name;
    this.m_oSelectedFile = new FormData();
    if (this.m_sFormDataType === 'file') {
      this.m_oSelectedFile.append('file', oInputFile);
    } else if (this.m_sFormDataType === 'image') {
      this.m_oSelectedFile.append('image', oInputFile)
    }
    this.m_oSelectedFileOutput.emit({
      name: this.m_sSelectedFileName,
      file: this.m_oSelectedFile
    });
  }

  /**
   * Hanlde files dropped to the file drop area
   * @param oInput
   */
  onFileDropped(oInput: any) {
    this.onFileSelect(oInput);
  }
}
