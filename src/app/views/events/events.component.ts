import { Component } from '@angular/core';
import {RiseToolbarComponent} from "../../components/rise-toolbar/rise-toolbar.component";

@Component({
  selector: 'rise-events',
  standalone: true,
  imports: [
    RiseToolbarComponent
  ],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent {

}
