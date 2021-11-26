// Import all Angular packages
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Import All Components
import { HomeComponent } from './home/home.component';
import { ListsComponent } from './lists/lists.component';
import { LoginComponent } from './login/login.component';
import { UserDetailsComponent } from './users/user-details/user-details.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { MessagesComponent } from './messages/messages.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { RegisterComponent } from './register/register.component';
import { ServerErrorComponent } from './server-error/server-error.component';

// Import Guards
import { AuthGuard } from './_guards/auth.guard';
import { UserLoggedInGuard } from './_guards/user-logged-in.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [AuthGuard],
    children: [
      { path: 'find-matches', component: UserListComponent },
      { path: 'user/id', component: UserDetailsComponent },
      { path: 'lists', component: ListsComponent },
      { path: 'messages', component: MessagesComponent },
    ],
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [UserLoggedInGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [UserLoggedInGuard],
  },
  { path: 'server-error', component: ServerErrorComponent },
  { path: '**', component: NotFoundComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
