import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../core/shared.module';

import { UserRoutingModule } from './user-routing.module';
import { LoginView } from './login/login.view';
import { RegistrationView } from './registration/registration.view';


@NgModule( {
	           declarations: [
		           LoginView,
		           RegistrationView,
	           ],
	           imports: [
		           SharedModule,
		           UserRoutingModule,
	           ],
	           exports: [
		           LoginView,
		           RegistrationView,
	           ],
           } )
export class UserModule{}
