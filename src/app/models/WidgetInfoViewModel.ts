import { RiseViewModel } from './RiseViewModel';

export class WidgetInfoViewModel extends RiseViewModel {
  id: string;
  organizationId: string;
  areaId: string;
  areaName: string;
  widget: string;
  bbox: string;
  type: string;
  icon: string;
  title: string;
  content: string;
  referenceTime: number;
  referenceDate: string;
  payload: { [key: string]: any } = {};
}