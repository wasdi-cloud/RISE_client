import {RiseViewModel} from "./RiseViewModel";

export class ErrorViewModel extends RiseViewModel {

  /**
   * Default Id
   */
  id: string;

  httpCode: number;

  errorStringCodes: string[];
}
