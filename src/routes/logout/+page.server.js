import { redirect } from '@sveltejs/kit';
import { Client } from '$lib/server/api.js';

export async function load(){
    throw redirect(302, '/');
}

export const actions = {
    default: async ({ cookies }) => {
        await Client.logout();
        cookies.delete('Bearer');
        throw redirect(302, '/');
    }
}
