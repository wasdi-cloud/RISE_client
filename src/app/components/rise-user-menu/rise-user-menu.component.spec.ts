import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseUserMenuComponent } from './rise-user-menu.component';

describe('RiseUserMenuComponent', () => {
  let component: RiseUserMenuComponent;
  let fixture: ComponentFixture<RiseUserMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseUserMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseUserMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
