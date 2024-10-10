import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmInsertedAreaDialogComponent } from './confirm-inserted-area-dialog.component';

describe('ConfirmInsertedAreaDialogComponent', () => {
  let component: ConfirmInsertedAreaDialogComponent;
  let fixture: ComponentFixture<ConfirmInsertedAreaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmInsertedAreaDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmInsertedAreaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
