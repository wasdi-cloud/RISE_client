import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintMapDialogComponent } from './print-map-dialog.component';

describe('PrintMapDialogComponent', () => {
  let component: PrintMapDialogComponent;
  let fixture: ComponentFixture<PrintMapDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintMapDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrintMapDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
