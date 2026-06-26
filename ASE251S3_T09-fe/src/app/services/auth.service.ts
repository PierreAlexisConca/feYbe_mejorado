import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  email: string;
  nombre: string;
  token: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = '/api/auth';
  private readonly SESSION_KEY = 'af_session';

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.api}/login`, data).pipe(
      tap(res => {
        sessionStorage.setItem(this.SESSION_KEY, JSON.stringify({
          id: res.id,
          email: res.email,
          nombre: res.nombre,
          token: res.token
        }));
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem(this.SESSION_KEY);
  }

  getSession(): { id: number; email: string; nombre: string; token: string } | null {
    const raw = sessionStorage.getItem(this.SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  getNombre(): string {
    return this.getSession()?.nombre ?? '';
  }
}
