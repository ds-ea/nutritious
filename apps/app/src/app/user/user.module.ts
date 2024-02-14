import { NgModule } from '@angular/core';
import { SharedModule } from '../core/shared.module';
import { LoginView } from './login/login.view';
import { RegistrationView } from './registration/registration.view';

import { UserRoutingModule } from './user-routing.module';


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
