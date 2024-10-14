import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmOverlappingAndSameNameAreaDialogComponent } from './confirm-overlapping-and-same-name-area-dialog.component';

describe('ConfirmOverlappingAndSameNameAreaDialogComponent', () => {
  let component: ConfirmOverlappingAndSameNameAreaDialogComponent;
  let fixture: ComponentFixture<ConfirmOverlappingAndSameNameAreaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmOverlappingAndSameNameAreaDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmOverlappingAndSameNameAreaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
