import { redirect } from '@sveltejs/kit';
import { Client } from '$lib/server/api.js';

export const actions = {
    default: async (event) => {
        const formData = Object.fromEntries(await event.request.formData());

        if (formData.password1 !== formData.password2) {
			return { response: "Passwords don't match." }
		}

        const user = {
            email: formData.email,
            password: formData.password1
        }

        const result = await Client.register(user);

        if (result.success)
            throw redirect(302, '/registrationSuccess');

        return { response: result.detail };
    }
}