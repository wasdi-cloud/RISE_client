import { UserRole } from './UserRole';
import { RiseViewModel } from './RiseViewModel';

export class InviteViewModel extends RiseViewModel {
  email: string;

  role: string;

  organizationId: string;
}
