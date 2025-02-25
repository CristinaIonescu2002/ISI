import { AuthService } from './pages/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Event, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.scss']
// })
// export class AppComponent implements OnInit {
//   isLoggedIn: boolean = false;
//   role: string | null = null;

//   constructor(private authService: AuthService, private router: Router) {}

//   ngOnInit(): void {
//     this.authService.currentUser.subscribe((user) => {
//       this.isLoggedIn = !!user;
//       this.role = user ? user.role : null;
//     });
//   }

//   logout(): void {
//     this.authService.logout();
//     this.router.navigate(['/login']);
//   }
// }
interface ITab {
  name: string;
  link: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  isAuthenticated: boolean = false;
  showPopup = false;

  tabs: ITab[] = [{
    name: 'Home',
    link: '/home'
  }, {
    name: 'Map',
    link: '/map'
  }, {
    name: 'Profile',
    link: '/profile'
  }];

  activeTab = this.tabs[0].link;

  constructor(private router: Router, public authService: AuthService) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.activeTab = event.url;
        console.log(event);
      }
    });
  }

  ngOnInit(): void {
    this.authService.isAuthenticated().subscribe((authenticated) => {
      this.isAuthenticated = authenticated; // Folosește parametrul `authenticated`
    });
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.authService.currentUser.subscribe((user) => {
        console.log('User on page change:', user);
      });
    });
  }

  showLogoutPopup() {
    this.showPopup = true;
  }

  confirmLogout() {
    this.showPopup = false; // Închide popup-ul
    this.authService.logout();
    this.router.navigate(['/login']); // Redirecționează la pagina de login
  }

  cancelLogout() {
    this.showPopup = false;
  }

  logout(): void {
    this.showPopup = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // See app.component.html
  mapLoadedEvent(status: boolean) {
    console.log('The map loaded: ' + status);
  }
}

