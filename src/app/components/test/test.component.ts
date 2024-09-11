import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [FormsModule, TranslateModule],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent {
  m_sSelectedLanguage: string = "en";

  constructor(private m_oTranslateService: TranslateService) { }

  onLanguageChange() { 
    this.m_oTranslateService.use(this.m_sSelectedLanguage);
  }
}
