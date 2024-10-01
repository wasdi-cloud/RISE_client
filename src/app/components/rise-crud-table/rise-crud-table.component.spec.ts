import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseCrudTableComponent } from './rise-crud-table.component';

describe('RiseCrudTableComponent', () => {
  let component: RiseCrudTableComponent;
  let fixture: ComponentFixture<RiseCrudTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseCrudTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseCrudTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
