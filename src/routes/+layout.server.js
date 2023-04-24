import { Client } from '$lib/server/api.js';

export async function load({ locals, cookies }) {
    if (locals.auth) {
        const interests = await Client.getInterests(cookies.get('Bearer'));
        return {
            interests: interests,
            auth: locals.auth
        }
    }
}