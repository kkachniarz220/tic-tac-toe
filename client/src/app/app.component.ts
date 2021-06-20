import {Component, OnInit} from '@angular/core';
import {Socket} from "ngx-socket-io";
import {SocketService} from "./core/services/socket/socket.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'tic-tac-toe';

  constructor(
    private socket: Socket,
    private _socketService: SocketService,
  ) { }

  ngOnInit() {
  }

}
