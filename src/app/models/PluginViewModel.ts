import {RiseViewModel} from "./RiseViewModel";


export class PluginViewModel extends RiseViewModel {

  /**
   * Default Id
   */
  id:string;

  name:string;

  shortDescription:string;

  longDescription:string;

  supportArchive:boolean;

  archivePrice:number;

  emergencyPrice:number;

  stringCode:string;

}
