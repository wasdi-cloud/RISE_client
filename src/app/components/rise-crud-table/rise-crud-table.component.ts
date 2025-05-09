import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from '@angular/core';
import { NgForOf, NgIf, TitleCasePipe } from '@angular/common';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatPaginator } from '@angular/material/paginator';
import { RiseButtonComponent } from '../rise-button/rise-button.component';

@Component({
  selector: 'rise-crud-table',
  standalone: true,
  imports: [
    NgForOf,
    MatIcon,
    MatIconButton,
    MatCell,
    MatHeaderCell,
    MatColumnDef,
    MatTable,
    MatHeaderRow,
    MatRow,
    MatRowDef,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRowDef,
    TitleCasePipe,
    NgIf,
    MatPaginator,
    RiseButtonComponent,
  ],
  templateUrl: './rise-crud-table.component.html',
  styleUrl: './rise-crud-table.component.css',
})
export class RiseCrudTableComponent implements OnChanges, AfterViewInit {
  @Input() m_asDisplayedColumns: string[] = [];
  @Input() m_aoDataSource: any[] = [];
  @Input() m_sButtonLabel: string="default";
  @Input() canClickRow: boolean = false;  // New input to allow row selection

  @Input() m_bAddUserBtn: boolean = true;
  @Input() m_bEmitClick: boolean = false;

  // Output to emit when a row is added or deleted
  @Output() m_oAdd = new EventEmitter<void>();
  @Output() m_oDelete = new EventEmitter<any>();
  @Output() m_oEditRow = new EventEmitter<any>();
  @Output() m_oTableData = new EventEmitter<any[]>(); // New output to emit table data
  @Output() m_oClickedRow = new EventEmitter<any[]>();  // New output to emit table data
  m_oDataSourceWithPaginator = new MatTableDataSource<any>(this.m_aoDataSource);

  @ViewChild(MatPaginator) paginator!: MatPaginator;


  ngAfterViewInit() {
    this.m_oDataSourceWithPaginator.paginator = this.paginator;
  }

  ngOnChanges() {
    // Update the paginator whenever the dataSource changes
    this.m_oDataSourceWithPaginator.data = this.m_aoDataSource;
    this.emitTableData(); // Emit the updated table data when the data source changes
  }

  onAddClick() {
    this.m_oAdd.emit();
    this.emitTableData(); // Emit the current table data after a row is added
  }

  onDeleteClick(row: any) {
    this.m_oDelete.emit(row);
    this.emitTableData(); // Emit the current table data after a row is deleted
  }

  onEditClick(row: any) {
    this.m_oEditRow.emit(row);
    this.emitTableData();
  }

  /**
   * Method to emit the current table data
   */
  emitTableData() {
    this.m_oTableData.emit(this.m_aoDataSource); // Emit the current table data
  }
  onRowClick(row: any) {
    if (this.canClickRow) {
      this.m_oClickedRow.emit(row)
    }
  }
}
