import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpactsDialogComponent } from './impacts-dialog.component';

describe('ImpactsDialogComponent', () => {
  let component: ImpactsDialogComponent;
  let fixture: ComponentFixture<ImpactsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImpactsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImpactsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
