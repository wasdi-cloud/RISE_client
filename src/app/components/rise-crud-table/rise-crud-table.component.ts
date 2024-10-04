import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, ViewChild} from '@angular/core';
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
export class RiseCrudTableComponent implements OnChanges, AfterViewInit{
  @Input() m_asDisplayedColumns: string[] = [];
  @Input() m_aoDataSource: any[] = [];

  // Output to emit when a row is added or deleted
  @Output() m_oAddRow = new EventEmitter<void>();
  @Output() m_oDeleteRow = new EventEmitter<any>();
  m_oDataSourceWithPaginator = new MatTableDataSource<any>(this.m_aoDataSource);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.m_oDataSourceWithPaginator.paginator = this.paginator;
  }

  ngOnChanges() {
    // Update the paginator whenever the dataSource changes
    this.m_oDataSourceWithPaginator.data = this.m_aoDataSource;
  }

  onAddClick() {
    this.m_oAddRow.emit();
  }

  onDeleteClick(row: any) {
    this.m_oDeleteRow.emit(row);
  }
}
