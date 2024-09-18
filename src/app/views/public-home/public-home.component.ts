import { Component } from '@angular/core';
import { RiseToolbarComponent } from '../../components/rise-toolbar/rise-toolbar.component';

@Component({
  selector: 'app-public-home',
  standalone: true,
  imports: [RiseToolbarComponent],
  templateUrl: './public-home.component.html',
  styleUrl: './public-home.component.css'
})
export class PublicHomeComponent {

}
