import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { FilterPipe } from '../../shared/pipes/filter.pipe';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rise-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    FilterPipe,
    FormsModule,
    MatSelectModule,
    MatSelect,
    TranslateModule,
  ],
  templateUrl: './rise-dropdown.component.html',
  styleUrl: './rise-dropdown.component.css',
})
export class RiseDropdownComponent {
  /**
   * The input array:
   */
  @Input() m_aoDropdownItems: Array<any> = [];

  /**
   * Is there a default option - add input? (i.e., pre-selected array)
   */
  @Input() m_aoSelectedItems: any = [];

  /**
   * Is the dropdown a multi-select dropdown? Default: false;
   */
  @Input() m_bIsMultiSelect: boolean = false;

  /**
   * Is the input list searchable? Default: false;
   */
  @Input() m_bHasSearch: boolean = false;

  /**
   * An optional placeholder text
   */
  @Input() m_sPlaceholder?: string = '';

  @Input() m_sLabel?: string = '';

  @Input() m_oController?: any;

  @Input() m_bIsDisabled?: boolean = false;

  @Input() m_oDeleteFn?: (args: any, controller: any) => void;

  /**
   * Emit the selection to listening parent
   */
  @Output() m_oSelectionChange: EventEmitter<any> = new EventEmitter();

  m_sSearchString: string = '';

  /**
   * Emit selection change to listening parent component
   */
  emitSelectionChange(oEvent) {
    console.log(oEvent)
    this.m_oSelectionChange.emit(oEvent);
  }

  getValues(oValues) {
    let aoNewValues = [];
    if (oValues.length > 0) {
      if (this.m_bIsMultiSelect === true) {
        oValues.forEach((oElement) => {
          if (oElement.name) {
            aoNewValues.push(oElement.name);
          } else {
            aoNewValues.push(oElement);
          }
        });
      } else {
        aoNewValues = oValues.name
          ? oValues.name
          : oValues.workspaceName
          ? oValues.workspaceName
          : oValues;
      }
    }
    return aoNewValues;
  }
}
