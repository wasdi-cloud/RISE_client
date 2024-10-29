import { RiseViewModel } from './RiseViewModel';

export class OTPViewModel extends RiseViewModel {
  /**
   * Default Id
   */
  id: string;

  userId: string;

  operation: string;

  userProvidedCode: string;

  verifyAPI: string;
}
