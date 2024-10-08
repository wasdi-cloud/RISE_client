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
  m_oSelectedFile: File|null=null;

  /**
   * Handle Files selected by the browse feature
   * @param oInput
   */
  onFileSelect(oInput: any) {
    const file = oInput.target.files[0];
    if (file) {
      this.m_oSelectedFile = file;
      this.m_oSelectedFileOutput.emit({
        name: this.m_sSelectedFileName,
        file: this.m_oSelectedFile
      });
    } else {
      console.error('No file selected.');
    }
  }

  /**
   * Hanlde files dropped to the file drop area
   * @param oInput
   */
  onFileDropped(oInput: any) {
    this.onFileSelect(oInput);
  }
}
