import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { RankingsComponent } from './rankings/rankings.component';
import { CreateComponent } from './create/create.component';
import { JoinComponent } from './join/join.component';
import { PlayerComponent } from './player/player.component';

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
        path: 'player',
        title: 'Player | IPL Fantasy',
        component: PlayerComponent
    }
];
