import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseCollaboratorsComponent } from './rise-collaborators.component';

describe('RiseCollaboratorsComponent', () => {
  let component: RiseCollaboratorsComponent;
  let fixture: ComponentFixture<RiseCollaboratorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseCollaboratorsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseCollaboratorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
