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

  @Input() m_bIsValid?: boolean = true;

  @Input() m_bHasTitle?: boolean = false;

  @Input() m_bShowChips: boolean = false;
  /*
    a flag to enable select all
   */

  @Input() m_bEnableSelectAll: boolean = false;


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
    } else {
      oValues.name ? (aoNewValues = oValues.name) : (aoNewValues = oValues);
    }
    return aoNewValues;
  }

  removePlugin(plugin: any, event: Event) {
    event.stopPropagation(); // Prevent dropdown from opening
    this.m_aoSelectedItems = this.m_aoSelectedItems.filter(item => item !== plugin);
    this.emitSelectionChange({ value: this.m_aoSelectedItems }); // Emit updated selection
  }
  toggleSelectAll(): void {
    this.m_aoSelectedItems = this.m_aoSelectedItems.filter(item => item !== null && item !== undefined);
    if (this.isAllSelected()) {
      // If all items are selected, unselect them
      this.m_aoSelectedItems = [];
    } else {
      // Otherwise, select all items in the dropdown
      this.m_aoSelectedItems = [...this.m_aoDropdownItems];
    }
    // Emit selection change to parent
    this.emitSelectionChange({ value: this.m_aoSelectedItems });
  }



  isAllSelected(): boolean {
    if (!this.m_aoSelectedItems || !this.m_aoDropdownItems) return false;
    if (this.m_aoSelectedItems.length !== this.m_aoDropdownItems.length) return false;

    const selectedSet = new Set(this.m_aoSelectedItems.map(item => item?.id || item?.name || item));
    return this.m_aoDropdownItems.every(item => selectedSet.has(item?.id || item?.name || item));
  }


  getPlaceholder(): string {
    if (this.m_sPlaceholder) {
      return this.m_sPlaceholder;
    } else {
      return this.m_sLabel;
    }
  }
}
