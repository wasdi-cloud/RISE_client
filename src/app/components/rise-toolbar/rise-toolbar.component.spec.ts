import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseToolbarComponent } from './rise-toolbar.component';

describe('RiseToolbarComponent', () => {
  let component: RiseToolbarComponent;
  let fixture: ComponentFixture<RiseToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseToolbarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
