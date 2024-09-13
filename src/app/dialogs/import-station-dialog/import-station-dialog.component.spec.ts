import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportStationDialogComponent } from './import-station-dialog.component';

describe('ImportStationDialogComponent', () => {
  let component: ImportStationDialogComponent;
  let fixture: ComponentFixture<ImportStationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportStationDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImportStationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
