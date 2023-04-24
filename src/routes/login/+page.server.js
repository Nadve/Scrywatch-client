import { redirect } from '@sveltejs/kit';
import { Client } from '$lib/server/api.js';

export const actions = {
    default: async ({ cookies, request }) => {
        const data = await request.formData();
        const email = data.get('email');
        const password = data.get('password');

        if (!email || !password) {
			return invalid(400, { error: 'Missing email or password' });
		}

        const user = {
            email: email,
            password: password
        };
        const result = await Client.login(user);

        if (result.token){
            cookies.set('Bearer', result.token, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 30
            });

            throw redirect(302, '/interests');
        }

        return { response: result.detail };
    }
}
