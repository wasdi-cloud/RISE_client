import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserViewModel } from '../../models/UserViewModel';
import { TranslateModule } from '@ngx-translate/core';
import { RiseButtonComponent } from '../rise-button/rise-button.component';

@Component({
  selector: 'rise-collaborators',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RiseButtonComponent],
  templateUrl: './rise-collaborators.component.html',
  styleUrl: './rise-collaborators.component.css',
})
export class RiseCollaboratorsComponent implements OnInit {
  @Input() m_aoUsers: Array<UserViewModel> = [];

  @Output() m_oInviteClick: EventEmitter<any> = new EventEmitter();

  ngOnInit(): void {}

  emitInviteClick() {
    this.m_oInviteClick.emit(true);
  }
}
