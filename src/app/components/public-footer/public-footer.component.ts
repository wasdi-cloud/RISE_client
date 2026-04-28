import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'public-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './public-footer.component.html',
  styleUrl: './public-footer.component.css',
})
export class PublicFooterComponent {}
