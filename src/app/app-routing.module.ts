// Import all Angular packages
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Import necessary Components
import { HomeComponent } from './home/home.component';
import { ListsComponent } from './lists/lists.component';
import { LoginComponent } from './login/login.component';
import { UserDetailsComponent } from './users/user-details/user-details.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { ChatComponent } from './chat/chat.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { RegisterComponent } from './register/register.component';
import { ServerErrorComponent } from './server-error/server-error.component';
import { UserEditComponent } from './users/user-edit/user-edit.component';

// Import Guards
import { AuthGuard } from './guards/auth.guard';
import { UserLoggedInGuard } from './guards/user-logged-in.guard';
import { PreventUnsavedChangesGuard } from './guards/prevent-unsaved-changes.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'edit-profile',
        component: UserEditComponent,
        canDeactivate: [PreventUnsavedChangesGuard],
      },
      { path: 'lists', component: ListsComponent },
      { path: 'chat', component: ChatComponent },
      { path: 'chat/:username', component: ChatComponent },
    ],
  },
  { path: 'find-matches', component: UserListComponent },
  { path: 'users/:username', component: UserDetailsComponent },
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
