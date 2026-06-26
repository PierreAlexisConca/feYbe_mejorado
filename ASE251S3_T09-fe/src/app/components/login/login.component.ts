import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email = '';
  password = '';
  recordar = false;
  cargando = false;
  errorMsg = '';
  mostrarPassword = false;

  // Errores de campo individuales
  emailError = '';
  passwordError = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  get emailValido(): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(this.email.trim());
  }

  get passwordValida(): boolean {
    return /^[0-9]{5}$/.test(this.password);
  }

  validarCampos(): boolean {
    this.emailError = '';
    this.passwordError = '';
    let ok = true;

    if (!this.email.trim()) {
      this.emailError = 'El email es obligatorio.';
      ok = false;
    } else if (!this.emailValido) {
      this.emailError = 'Ingresa un email con formato válido.';
      ok = false;
    }

    if (!this.password) {
      this.passwordError = 'La contraseña es obligatoria.';
      ok = false;
    } else if (!/^[0-9]{5}$/.test(this.password)) {
      this.passwordError = 'La contraseña debe ser exactamente 5 dígitos numéricos.';
      ok = false;
    }

    return ok;
  }

  iniciarSesion(): void {
    this.errorMsg = '';
    if (!this.validarCampos()) return;

    this.cargando = true;
    this.auth.login({ email: this.email.trim().toLowerCase(), password: this.password }).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.cargando = false;
        const msg = err?.error?.message || err?.error?.detail || 'Credenciales incorrectas. Verifica e intenta de nuevo.';
        this.errorMsg = msg;
      }
    });
  }

  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  soloDigitos(event: KeyboardEvent): void {
    const permitidos = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (permitidos.includes(event.key)) return;
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onPasswordChange(): void {
    if (this.password.length > 5) {
      this.password = this.password.slice(0, 5);
    }
  }
}
