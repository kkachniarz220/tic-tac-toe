import { Component, OnInit } from '@angular/core';
import { SocketService } from 'src/app/core/services/socket/socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  activeUsers$ = this._socketService.activeUsers$;
  myGames$ = this._socketService.myGames$;
  displayedColumns: string[] = ['playerXId', 'playerOId', 'status', 'createdAt'];

  constructor(
    private _router: Router,
    private _socketService: SocketService,
  ) { }

  ngOnInit(): void {
  }

  inviteToGame(user: any) {
    this._socketService.createGame(user);
  }

  goToGame(game: any) {
    this._router.navigate(['game', game.id]);
  }
}
