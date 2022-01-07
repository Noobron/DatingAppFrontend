// Import Angular packages
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Import Modules
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './modules/shared.module';

// Import Components
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { UserCardComponent } from './users/user-card/user-card.component';
import { ChatComponent } from './chat/chat.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ServerErrorComponent } from './server-error/server-error.component';
import { LoginComponent } from './login/login.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { UserDetailsComponent } from './users/user-details/user-details.component';
import { UserEditComponent } from './users/user-edit/user-edit.component';
import { PhotoEditorComponent } from './users/user-edit/photo-editor/photo-editor.component';
import { ImageUploadComponent } from './users/user-edit/image-upload/image-upload.component';
import { UpdateProfileModalComponent } from './users/user-edit/update-profile-modal/update-profile-modal.component';
import { ChatBoxComponent } from './chat/chat-box/chat-box.component';
import { MessageComponent } from './chat/chat-box/message/message.component';

// Import Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { LoadingInterceptor } from './interceptors/loading.interceptor';

// Import Pipes
import { TimeAgo } from './pipes/time-ago.pipe';

// Import services
import { AccountStatusService } from './services/account/account-status.service';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    RegisterComponent,
    UserListComponent,
    UserCardComponent,
    ChatComponent,
    NotFoundComponent,
    ServerErrorComponent,
    LoginComponent,
    UserDetailsComponent,
    TimeAgo,
    UserEditComponent,
    PhotoEditorComponent,
    ImageUploadComponent,
    UpdateProfileModalComponent,
    ChatBoxComponent,
    MessageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
    [
      {
        provide: APP_INITIALIZER,
        multi: true,
        deps: [AccountStatusService],
        useFactory: (accountStatusService: AccountStatusService) => () => null,
      },
    ],
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
