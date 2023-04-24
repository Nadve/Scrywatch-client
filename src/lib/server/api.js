import { error } from '@sveltejs/kit';
import https from 'https';
import fetch from 'node-fetch';

const root = "https://localhost:7079";
const cards = root + '/card/?';
const cardNames = root + '/card/names';
const authRegister = root + '/auth/register';
const authLogin = root + '/auth/login';
const authLogout = root + '/auth/logout';
const interests = root + '/interest/';
const interestCreate = root + '/interest/create/';
const interestDelete = root + '/interest/delete';
const interestUpdate = root + '/interest/update';

export class Client {
    static async getCardNames(){
        return { cardNames: await this.makeRequest(cardNames) };
    }

    static async getCards(name){
        const params = new URLSearchParams({ name: name });
        return await this.makeRequest(cards + params);
    }

    static async getInterests(cookie){
        return await this.makeRequest(
            interests,
            cookie,
        );
    }

    static async createInterest(interest, cookie){
        return { interest: await this.makeRequest(
            interestCreate,
            cookie,
            interest,
            'POST'
        )};
    }

    static async updateInterest(interest, cookie){
        await this.makeRequest(
            interestUpdate,
            cookie,
            interest,
            'POST'
        );
    }

    static async deleteInterest(interest, cookie){
        await this.makeRequest(
            interestDelete,
            cookie,
            interest,
            'POST'
        );
    }

    static async register(user){
        return await this.makeRequest(
            authRegister,
            null,
            user,
            'POST'
        );
    }

    static async login(user){
        return await this.makeRequest(
            authLogin,
            null,
            user,
            'POST'
        );
    }

    static async logout(){
        return await this.makeRequest(
            authLogout,
            null,
            null,
            'POST'
        );
    }

    static async makeRequest(endpoint, cookie, body, method = 'GET'){
        // if server is run on localhost fetch will fail because
        // of self-signed certificate if (rejectUnauthorized: true)
        const agent = new https.Agent({ rejectUnauthorized: false });

        let options = {
            method: method,
            agent: agent
        };

        if (body){
            options.body = JSON.stringify(body)
            options.headers = { 'Content-Type': 'application/json' };
        }

        if (cookie){
            options.headers = {
                ...options.headers,
                'Authorization': 'Bearer ' + cookie,
            };
        }

        try{
            const response = await fetch(endpoint, options);
            return await response.json();
        }
        catch(err){
            if(err.message.split(' ').includes('ECONNREFUSED')){
                throw error(500, 'Server is not responding');
            }
        }
    }
}