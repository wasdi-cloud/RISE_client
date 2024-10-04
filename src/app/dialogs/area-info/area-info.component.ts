import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Area } from '../../shared/models/area';

@Component({
  selector: 'app-area-info',
  standalone: true,
  imports: [],
  templateUrl: './area-info.component.html',
  styleUrl: './area-info.component.css'
})
export class AreaInfoComponent implements OnInit {
  m_oSelectedArea: Area = null;
  constructor(@Inject(MAT_DIALOG_DATA) public m_oData) { 
    // if (this.m_oData) {
    //   this.m_oSelectedArea = this.m_oData.selectedArea;
    //   console.log(this.m_oSelectedArea)
    // }
  }
  
  ngOnInit(): void {
    // this.m_oSelectedArea = this.m_oData.selectedArea
    // console.log(this.m_oSelectedArea)
  }
}
