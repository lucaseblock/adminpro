import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { tap, map, catchError } from 'rxjs/operators'

import { RegisterForm } from '../interfaces/register-form.interface';
import { LoginForm } from '../interfaces/login-form.interface';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';

import { Usuario } from '../models/usuario.model';

const base_url = environment.base_url;

declare const gapi: any;

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  public auth2: any;

  public usuario: Usuario;

  constructor( private http: HttpClient, private router: Router, private ngZone: NgZone ) { 
    this.googleInit();
   }


  get token(): string {
    return localStorage.getItem('token') || '';
  }

  get uid(): string {
    return this.usuario.uid || '';
  }

  googleInit() {

    return new Promise( resolve =>  {

      console.log('google init');

      gapi.load('auth2', () => {
        // Retrieve the singleton for the GoogleAuth library and set up the client.
        this.auth2 = gapi.auth2.init({
          client_id: '71984050213-r07te3a0ol51uadd1ns57vjfiso24gu2.apps.googleusercontent.com',
          cookiepolicy: 'single_host_origin',
         
        });

        resolve();
      });  

    });

  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
    this.auth2.signOut().then( () => {

      this.ngZone.run( () => {
        this.router.navigateByUrl('/login');
      });

    });
  }

  validarToken(): Observable<boolean> {

    return this.http.get(`${ base_url }/login/renew`, {

      headers: {
        'x-token': this.token
      }

    }).pipe(
      map( (resp: any) => {
        const {
          email,
          google,
          nombre,
          role,
          img = '',
          uid
        } = resp.usuario;

        this.usuario = new Usuario( nombre, email, '', img, google, role, uid );

        localStorage.setItem('token', resp.token );
        return true;
      }),
      catchError( error => of( false ) )
    );
  }

  crearUsuario( formData: RegisterForm ) {
    
    return this.http.post( `${ base_url }/usuarios`, formData )
          .pipe(
            tap( (resp: any) => {
              localStorage.setItem('token', resp.token )
            })
          );
  };

  actualizarPerfil( data: { email: string, nombre: string, role: string } ) {

    data = {
      ...data,
      role: this.usuario.role
    }

    return this.http.put( `${ base_url }/usuarios/${ this.uid }`, data, {
      headers: {
        'x-token': this.token
      }
    });
  }

  login( formData: LoginForm ) {
    
    return this.http.post( `${ base_url }/login`, formData )
          .pipe(
            tap( (resp: any) => {
              localStorage.setItem('token', resp.token )
            })
          );
  };

  loginGoogle( token ) {
    
    return this.http.post( `${ base_url }/login/google`, { token } )
          .pipe(
            tap( (resp: any) => {
              localStorage.setItem('token', resp.token )
            })
          );
  };

}
