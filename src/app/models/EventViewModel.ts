import {RiseViewModel} from "./RiseViewModel";

export class EventViewModel extends RiseViewModel {

  /**
   * Default Id
   */
  id?: string;

  name?: string;

  type?: string;

  bbox?: string;

  startDate?: number;

  endDate?: number;

  peakDate?: number;

  description?:string;

  markerCoordinates?:string


}
