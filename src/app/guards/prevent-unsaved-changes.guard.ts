// Import Angular packages
import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';

// Import Components
import { UserEditComponent } from '../users/user-edit/user-edit.component';

@Injectable({
  providedIn: 'root',
})
export class PreventUnsavedChangesGuard implements CanDeactivate<unknown> {
  canDeactivate(component: UserEditComponent): boolean {
    if (component.model.dirty) {
      return confirm(
        'Are you sure want to continue? Any unsaved changes will be lost.'
      );
    }
    return true;
  }
}
