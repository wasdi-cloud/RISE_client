import {UserRole} from "./UserRole";
import {RiseViewModel} from "./RiseViewModel";

export class InviteViewModel extends RiseViewModel {

  email: string;

  role: UserRole;

  organizationId: string;

}
