import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseCollaboratorsDialogComponent } from './rise-collaborators-dialog.component';

describe('RiseCollaboratorsDialogComponent', () => {
  let component: RiseCollaboratorsDialogComponent;
  let fixture: ComponentFixture<RiseCollaboratorsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseCollaboratorsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseCollaboratorsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
