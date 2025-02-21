import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { SignupComponent } from './features/signup/signup.component';
import { LoginComponent } from './features/login/login.component';
import { HomeComponent } from './features/home/home.component';
import { RankingsComponent } from './features/rankings/rankings.component';
import { CreateComponent } from './features/create/create.component';
import { JoinComponent } from './features/join/join.component';
import { PlayerComponent } from './features/player/player.component';
import { SquadComponent } from './features/squad/squad.component';
import { ErrorComponent } from './features/error/error.component';

export const routes: Routes = [
    {
        path: '',
        title: 'IPL Fantasy',
        component: LandingComponent
    },
    {
        path: 'signup',
        title: 'Sign Up | IPL Fantasy',
        component: SignupComponent
    },
    {
        path: 'login',
        title: 'Log In | IPL Fantasy',
        component: LoginComponent
    },
    {
        path: 'home',
        title: 'Home | IPL Fantasy',
        component: HomeComponent
    },
    {
        path: 'rankings',
        title: 'Player Rankings | IPL Fantasy',
        component: RankingsComponent
    },
    {
        path: 'create',
        title: 'Create League | IPL Fantasy',
        component: CreateComponent
    },
    {
        path: 'join',
        title: 'Join League | IPL Fantasy',
        component: JoinComponent
    },
    {
        path: 'error',
        title: 'Error | IPL Fantasy',
        component: ErrorComponent
    },
    {
        path: ':name',
        title: 'Player | IPL Fantasy',
        component: PlayerComponent
    },
    {
        path: ':league/:name',
        title: 'Squad | IPL Fantasy',
        component: SquadComponent
    },
    {
        path: '**',
        title: 'Error | IPL Fantasy',
        component: ErrorComponent
    }
];
