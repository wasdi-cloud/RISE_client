import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseDragAndDropComponent } from './rise-drag-and-drop.component';

describe('RiseDragAndDropComponent', () => {
  let component: RiseDragAndDropComponent;
  let fixture: ComponentFixture<RiseDragAndDropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseDragAndDropComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseDragAndDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
