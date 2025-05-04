import {RiseViewModel} from "./RiseViewModel";
import {EventType} from "./EventType";

export class EventViewModel extends RiseViewModel {

  /**
   * Default Id
   */
  id?: string;

  name?: string;

  type?: EventType;

  bbox?: string;

  startDate?: number;

  endDate?: number;

  peakDate?: number;

  description?:string;

  markerCoordinates?:string;

  inGoing?:boolean=false;

  publicEvent?:boolean=true;




}
