import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginView } from './user/login/login.view';
import { RegistrationView } from './user/registration/registration.view';


const routes:Routes = [
	{
		path: '', pathMatch: 'full',
		redirectTo: '/study'
//		loadChildren: () => import('./splash/splash.module').then( m => m.SplashModule ),
	},
	{
		path: 'study',
		loadChildren: () => import('./study/study.module').then( m => m.StudyModule ),
	},
	{
		path: 'log',
		loadChildren: () => import('./log/log.module').then( m => m.LogModule ),
	},
	
	{ path: 'login', component: LoginView },
	{ path: 'register', component: RegistrationView }
	
];

@NgModule( {
	           imports: [
		           RouterModule.forRoot( routes, { preloadingStrategy: PreloadAllModules } ),
	           ],
	           exports: [ RouterModule ],
           } )
export class AppRoutingModule{}
