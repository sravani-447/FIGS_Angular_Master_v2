import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Theme {
  name: string;
  displayName: string;
  cssClass: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themes: Theme[] = [
    { name: 'light', displayName: 'Light Theme', cssClass: 'theme-light' },
    { name: 'dark', displayName: 'Dark Theme', cssClass: 'theme-dark' },
    { name: 'ocean', displayName: 'Ocean Theme', cssClass: 'theme-ocean' },
    { name: 'forest', displayName: 'Forest Theme', cssClass: 'theme-forest' },
    { name: 'sunset', displayName: 'Sunset Theme', cssClass: 'theme-sunset' },
    { name: 'midnight', displayName: 'Midnight Theme', cssClass: 'theme-midnight' },
    { name: 'lavender', displayName: 'Lavender Theme', cssClass: 'theme-lavender' }
  ];

  private currentThemeSubject = new BehaviorSubject<Theme>(this.themes[0]);
  public currentTheme$: Observable<Theme> = this.currentThemeSubject.asObservable();

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
      const theme = this.themes.find(t => t.name === savedTheme);
      if (theme) {
        this.applyTheme(theme);
      }
    } else {
      // Default to light theme
      this.applyTheme(this.themes[0]);
    }
  }

  public getThemes(): Theme[] {
    return this.themes;
  }

  public applyTheme(theme: Theme): void {
    // Ensure DOM is ready
    setTimeout(() => {
      // Remove all theme classes
      this.themes.forEach(t => {
        document.body.classList.remove(t.cssClass);
      });

      // Add the selected theme class
      document.body.classList.add(theme.cssClass);

      // Save to localStorage
      localStorage.setItem('selectedTheme', theme.name);

      // Update the subject
      this.currentThemeSubject.next(theme);
    }, 0);
  }

  public getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  public setThemeByName(themeName: string): void {
    const theme = this.themes.find(t => t.name === themeName);
    if (theme) {
      this.applyTheme(theme);
    }
  }
}