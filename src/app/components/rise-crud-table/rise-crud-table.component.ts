import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {NgForOf, NgIf, TitleCasePipe} from "@angular/common";
import {
  MatCell, MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable,
  MatTableDataSource
} from "@angular/material/table";
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatPaginator} from "@angular/material/paginator";
import {RiseButtonComponent} from "../rise-button/rise-button.component";

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
    MatButton,
    MatHeaderRow,
    MatRow,
    MatRowDef,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRowDef,
    TitleCasePipe,
    NgIf,
    MatPaginator,
    RiseButtonComponent
  ],
  templateUrl: './rise-crud-table.component.html',
  styleUrl: './rise-crud-table.component.css'
})
export class RiseCrudTableComponent {
  @Input() displayedColumns: string[] = [];
  @Input() dataSource: any[] = [];

  // Output to emit when a row is added or deleted
  @Output() addRow = new EventEmitter<void>();
  @Output() deleteRow = new EventEmitter<any>();
  dataSourceWithPaginator = new MatTableDataSource<any>(this.dataSource);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSourceWithPaginator.paginator = this.paginator;
  }

  ngOnChanges() {
    // Update the paginator whenever the dataSource changes
    this.dataSourceWithPaginator.data = this.dataSource;
  }

  onAddClick() {
    this.addRow.emit();
  }

  onDeleteClick(row: any) {
    this.deleteRow.emit(row);
  }
}
