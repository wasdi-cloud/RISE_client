import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatLonDialogComponent } from './lat-lon-dialog.component';

describe('LatLonDialogComponent', () => {
  let component: LatLonDialogComponent;
  let fixture: ComponentFixture<LatLonDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LatLonDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LatLonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
