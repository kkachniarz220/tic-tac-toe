import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject } from 'rxjs';
import { take, skip, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface IUser {
  id: string;
  nickname: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _user$ = new BehaviorSubject<IUser>(null as any);
  public readonly user$ = this._user$.asObservable();

  constructor(
    private _socket: Socket,
    private _router: Router,
  ) { }

  async initialize() {
    if (localStorage.getItem('nickname')) {
      return await this.login(localStorage.getItem('nickname') as string);
    }
    return;
  }

  public get isAuthorized(): boolean {
    return !!this.user;
  }

  public get user(): IUser {
    return this._user$.value;
  }

  public login(nickname: string): Promise<{ success: boolean, user: IUser }> {
    this._socket.emit('login', { nickname });
    return this._socket.fromEvent('login')
      .pipe(
        skip(1),
        take(1),
        tap(({ success, user }: any) => {
          if (success) {
            this._user$.next(user);
            localStorage.setItem('nickname', nickname);
          }
        }),
      )
      .toPromise();
  };

  public logout() {
    this._socket.emit('logout');
    this._user$.next(null as any);
    localStorage.removeItem('nickname');
    this._router.navigate(['login']);
  }

}
