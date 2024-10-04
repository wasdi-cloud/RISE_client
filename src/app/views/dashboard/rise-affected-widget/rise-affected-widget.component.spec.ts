import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseAffectedWidgetComponent } from './rise-affected-widget.component';

describe('RiseAffectedWidgetComponent', () => {
  let component: RiseAffectedWidgetComponent;
  let fixture: ComponentFixture<RiseAffectedWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseAffectedWidgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseAffectedWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
