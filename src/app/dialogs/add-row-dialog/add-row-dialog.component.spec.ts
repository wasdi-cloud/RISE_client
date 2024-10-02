import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRowDialogComponent } from './add-row-dialog.component';

describe('AddRowDialogComponent', () => {
  let component: AddRowDialogComponent;
  let fixture: ComponentFixture<AddRowDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRowDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddRowDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
