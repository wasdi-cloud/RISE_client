import {RiseViewModel} from "./RiseViewModel";

export class AreaViewModel extends RiseViewModel {

  /**
   * Default Id
   */
  id: string;

  name: string;

  description: string;

  creationDate: number;

  subscriptionId: string;

  bbox: string;

  markerCoordinates: string;

  shapeFileMask: string;

  supportArchive: boolean;

  archiveStartDate: number;

  archiveEndDate: number;

  plugins: string[];

}
