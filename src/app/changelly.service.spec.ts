import { TestBed, inject } from '@angular/core/testing';

import { ChangellyService } from './changelly.service';

describe('ChangellyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChangellyService]
    });
  });

  it('should be created', inject([ChangellyService], (service: ChangellyService) => {
    expect(service).toBeTruthy();
  }));
});
