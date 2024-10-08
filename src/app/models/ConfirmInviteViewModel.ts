import {RiseViewModel} from "./RiseViewModel";

export class ConfirmInviteViewModel extends RiseViewModel {

  userId: string;

  mail: string;

  code: string;

  name: string;

  surname: string;

  mobile: string;

  acceptedTermsAndConditions: boolean;

  acceptedPrivacy: boolean;

  notifyNewsletter: boolean = true;

  notifyMaintenance: boolean = true;

  notifyActivities: boolean = true;

  defaultLanguage: string = "EN";

  password: string;

}
