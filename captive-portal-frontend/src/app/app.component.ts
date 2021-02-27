import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'GK7 Captive Portal';


  constructor(private router: Router, private activatedRoute: ActivatedRoute)
  {

  }

  ngOnInit()
  {
    console.log(this.activatedRoute.snapshot.params)
  }
}
