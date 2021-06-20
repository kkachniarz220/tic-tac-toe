import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from 'src/app/core/services/socket/socket.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent {

  @ViewChild(MatSort) sort: MatSort | undefined;

  myGames$ = this._socketService.myGames$;
  displayedColumns: string[] = ['opponent', 'status', 'createdAt'];
  user = this._authService.user;

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _socketService: SocketService,
  ) { }

  goToGame(game: any) {
    this._router.navigate(['game', game.id, 'play']);
  }

}
