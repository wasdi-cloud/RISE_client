import { TestBed } from '@angular/core/testing';

import { NotificationsDialogsService } from './notifications-dialogs.service';

describe('NotificationsDialogsService', () => {
  let service: NotificationsDialogsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationsDialogsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
