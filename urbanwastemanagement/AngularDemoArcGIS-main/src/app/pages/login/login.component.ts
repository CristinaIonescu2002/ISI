
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  login(): void {
    this.authService.login(this.email, this.password)
      .then((user) => {
        if (user.role === 'admin') {
          this.router.navigate(['/home']);
        } else if (user.role === 'customer') {
          this.router.navigate(['/map']);
        }
      })
      .catch((error) => {
        console.error('Eroare la autentificare:', error);
        this.errorMessage = 'Credentialele sunt invalide. Vă rugăm să încercați din nou.';
      });
  }
  
  goToRegister(): void {
    this.router.navigate(['/register']); // Redirecționează către pagina de înregistrare
  }
  
  
}
