import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ServerRequests } from '../../services/ServerRequests';
import { decrypt } from '../../shared/Aes_security/aes_security';
   

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  userid: string = '';
  password: string = '';

  // UI States
  showPassword: boolean = false;
  isLoading: boolean = false;
  decrypt:typeof decrypt = decrypt;

  constructor(  
    private http: HttpClient,
    private router: Router,
    private services: ServerRequests
  ) { }

  // Function to toggle password visibility
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    if (!this.userid || !this.password) {
      alert('Username and Password are required');
      return;
    }

    this.isLoading = true;

    this.services.UserLogin(this.userid, this.password)
      .subscribe({
        next: (response) => {
          const parsedSession = JSON.parse(response);
          let decryptedData =  decrypt(parsedSession.Data);
          console.log('Decrypted Session Data:', decryptedData);
          parsedSession.Data = JSON.parse(decryptedData);
          if (parsedSession.Data && parsedSession.Data.length > 0) {
            sessionStorage.setItem("Session", JSON.stringify(parsedSession));
            // Small delay to allow loader animation to finish beautifully
            const designationId = parsedSession.Data[0].designation_id;
            // Try to get landing page from backend for this designation
            this.services.GetModulesByDesignation(designationId).subscribe({
              next: (res: any) => {
                let landing: string | null = null;

                if (res && res.Data) {
                  const first = Array.isArray(res.Data) && res.Data.length ? res.Data[0] : res.Data;
                  if (first) {
                    landing = first.landingpage || first.landing_page || first.landing || null;
                  }
                }

                // fallback to localStorage if backend didn't return landing
                if (!landing) {
                  const landingKey = `designationLanding_${designationId}`;
                  landing = localStorage.getItem(landingKey);
                }

                if (landing && landing.trim()) {
                  this.isLoading = false;
                  const path = landing.startsWith('/') ? landing : `/${landing}`;
                  this.router.navigate([path]);
                  return;
                }

                if (parsedSession.Data[0].designation_name == "ADMIN") {
                  this.isLoading = false;
                  this.router.navigate(['/usermanagement']);
                }
                else if(parsedSession.Data[0].designation_name == "FOREST_MINISTER"){
                  this.isLoading = false;
                  this.router.navigate(['/maindashboard']);
                }
                else {
                  setTimeout(() => {
                    this.isLoading = false;
                    this.router.navigate(['/map']);
                  }, 1000);
                }
              },
              error: (err: any) => {
                console.error('GetModulesByDesignation failed', err);
                // on error fallback to localStorage and defaults
                const landingKey = `designationLanding_${designationId}`;
                const landing = localStorage.getItem(landingKey);
                if (landing && landing.trim()) {
                  this.isLoading = false;
                  const path = landing.startsWith('/') ? landing : `/${landing}`;
                  this.router.navigate([path]);
                  return;
                }

                if (parsedSession.Data[0].designation_name == "ADMIN") {
                  this.isLoading = false;
                  this.router.navigate(['/usermanagement']);
                }
                else if(parsedSession.Data[0].designation_name == "FOREST_MINISTER"){
                  this.isLoading = false;
                  this.router.navigate(['/maindashboard']);
                }
                else {
                  setTimeout(() => {
                    this.isLoading = false;
                    this.router.navigate(['/map']);
                  }, 1000);
                }
              }
            });
            
          } else {
            this.isLoading = false;
            alert("Invalid Credentials. Access Denied.");
          }
        },
        error: (error) => {
          this.isLoading = false;
          alert('Failed to connect to Forest Server.');
        }
      });
  }
  getlandingpage(designationId: number): void {
    this.services.GetModulesByDesignation(designationId)
      .subscribe({
        next: (res: any) => {
       
        },
        error: err => console.error(err)
      });
  }
  
}

