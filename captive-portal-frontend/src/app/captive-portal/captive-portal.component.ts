import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-captive-portal',
  templateUrl: './captive-portal.component.html',
  styleUrls: ['./captive-portal.component.css']
})
export class CaptivePortalComponent implements OnInit {

  constructor(private route: ActivatedRoute, private spinner: NgxSpinnerService)
  {
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, 10000);
  }

  ngOnInit(): void 
  {
  }

}
