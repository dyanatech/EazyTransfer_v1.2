import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //private authUrl = 'http://test-ez-dev.us-east-1.elasticbeanstalk.com/api'; // Adjust this URL
  private authUrl = 'http://localhost:5000/api'; // Adjust this URL


  private _loading = new BehaviorSubject<boolean>(false);
  public readonly loading$ = this._loading.asObservable();

  constructor(private http: HttpClient) { }

  show() {
    this._loading.next(true);
  }

  hide() {
    this._loading.next(false);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/user/login`, { email, password }).pipe(
      tap(response => this.setSession(response)),
      catchError(error => {
        // Handle error
        console.error(error);
        return of(null);
      })
    );
  }

  register(payload: any): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/user/create`, payload).pipe(
      tap(response => this.setSession(response)),
      catchError(error => {
        // Handle error
        console.error(error);
        return of(null);
      })
    );
  }

  getAccountDetails(userId: any): Observable<any> {
    return this.http.get<any>(`${this.authUrl}/account/info/${userId}`).pipe(
      map(response => response),
      catchError(error => {
        // Handle error
        console.error(error);
        return of(null);
      })
    );
  }

  send(payload: any): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/mv/send`, payload).pipe(
      map(response => response),
      catchError(error => {
        // Handle error
        console.error(error);
        return of(null);
      })
    );
  }

  private setSession(authResult: any): void {
    // Example of setting the session with localStorage
    
    localStorage.setItem('USER_INFO', (typeof authResult) !== 'string' ? JSON.stringify(authResult) : authResult);
    // You might want to store other details and handle token expiration as well
  }
  retrieveUserInfo() {
    const data = localStorage.getItem('USER_INFO');
    if( data ) {
      return JSON.parse(data);
    }
    return data;
  }

  logout(): void {
    localStorage.removeItem('USER_INFO');
    // Redirect to login or do other cleanup actions
  }

  public isLoggedIn(): boolean {
    return !!localStorage.getItem('USER_INFO');
  }
}
