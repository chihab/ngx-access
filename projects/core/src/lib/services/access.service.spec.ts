/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AccessService } from './access.service';

describe('Service: Access', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccessService]
    });
  });

  it('should ...', inject([AccessService], (service: AccessService) => {
    expect(service).toBeTruthy();
  }));
});
