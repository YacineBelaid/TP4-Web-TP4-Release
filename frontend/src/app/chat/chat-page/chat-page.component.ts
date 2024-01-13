import { Component, OnDestroy, OnInit } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { AuthenticationService } from "src/app/login/authentication.service";
import { MessagesService } from "../messages.service";
import { Router } from "@angular/router";
import { WebSocketEvent, WebSocketService } from "../websocket.service";
import { FileReaderService } from "../file-reader.service";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "app-chat-page",
  templateUrl: "./chat-page.component.html",
  styleUrls: ["./chat-page.component.css"],
})
export class ChatPageComponent implements OnInit, OnDestroy {
  messages$ = this.messagesService.getMessages();
  username$ = this.authenticationService.getUsername();

  username: string | null = null;
  usernameSubscription: Subscription;

  notifications$: Observable<WebSocketEvent> | null = null;
  notificationsSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private messagesService: MessagesService,
    private authenticationService: AuthenticationService,
    private webSocketService: WebSocketService,
    private fileReaderService: FileReaderService
  ) {
    this.usernameSubscription = this.username$.subscribe((u) => {
      this.username = u;
    });
  }

  ngOnInit() {
    this.notifications$ = this.webSocketService.connect();
    this.notificationsSubscription = this.notifications$.subscribe(() => {
      try {
        this.messagesService.fetchMessages();
      }catch(error: HttpErrorResponse | any) {
        if (error.status === 403) {
          this.onLogout();
        }
      }
    });
      this.messagesService.fetchMessages().catch(error => {
        if (error.status === 403) {
          this.onLogout();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.usernameSubscription) {
      this.usernameSubscription.unsubscribe();
    }
    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }

  async onPublishMessage(event: { message: string; file: File | null }) {
    if (this.username != null) {
      const imageData =
        event.file != null
          ? await this.fileReaderService.readFile(event.file)
          : null;
      try {
        await this.messagesService.postMessage({
          text: event.message,
          username: this.username,
          imageData: imageData,
        });
      } catch (error: HttpErrorResponse | any) {
        if (error.status === 403) {
          this.onLogout();
        }
      }
    }
  }

  async onLogout() {
    this.messagesService.clear();
    await this.authenticationService.logout();
    this.router.navigate(["/"]);
  }
}
