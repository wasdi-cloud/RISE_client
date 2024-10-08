import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportShapeFileStationDialogComponent } from './import-shape-file-station-dialog.component';

describe('ImportStationDialogComponent', () => {
  let component: ImportShapeFileStationDialogComponent;
  let fixture: ComponentFixture<ImportShapeFileStationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportShapeFileStationDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportShapeFileStationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
