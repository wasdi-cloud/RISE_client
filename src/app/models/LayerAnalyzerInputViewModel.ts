import { RiseViewModel } from './RiseViewModel';

export class LayerAnalyzerInputViewModel extends RiseViewModel {
  layerIds: string [] = [];
  bbox: string;
  filter: string;
  areaId:string
  mapId:string
  pluginId:string
}
