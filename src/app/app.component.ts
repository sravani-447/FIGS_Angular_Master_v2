import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  enablepage: boolean = false;

  constructor(private http: HttpClient, private router: Router,private route: ActivatedRoute) {}

 ngOnInit() {
  const currentUrl = window.location.origin + window.location.pathname;
  if (!window.location.pathname.startsWith('/capacity/Approvedfeedback')) {
    this.router.navigate(['login']);
  }
  else{
    // this.router.navigate([currentUrl]);
  }
}
  
}
