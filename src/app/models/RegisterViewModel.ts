import {RiseViewModel} from "./RiseViewModel";
import {UserViewModel} from "./UserViewModel";


export class RegisterViewModel extends RiseViewModel {
  admin: UserViewModel;

  organization: OrganizationViewModel;

  password: string;

}
