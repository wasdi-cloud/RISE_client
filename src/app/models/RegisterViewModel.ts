import {RiseViewModel} from "./RiseViewModel";
import {UserViewModel} from "./UserViewModel";
import {OrganizationViewModel} from "./OrganizationViewModel";


export class RegisterViewModel extends RiseViewModel {
  admin: UserViewModel;

  organization: OrganizationViewModel;

  password: string;

}
