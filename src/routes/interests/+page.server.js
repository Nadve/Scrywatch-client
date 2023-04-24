import { redirect } from '@sveltejs/kit';
import { Client } from '$lib/server/api.js';

export function load({ locals }){
    if(!locals.auth){
        throw redirect(302, "/login");
    }
}

export const actions = {
    default: async ({ cookies, request }) => {
        const cookie = cookies.get('Bearer');
        const data = await request.formData();

        const deleted = data.get('deleted');
        if (deleted !== '') {
            const del = deleted.split(',');
            await Client.deleteInterest(del, cookie);
        }

        const updated = data.get('updated');
        if (updated !== '') {
            const update = deserialize(updated);
            await Client.updateInterest(update, cookie);
        }

        throw redirect(302, '/interests');
    }
}

function deserialize(text) {
    const DELIMITER = ',';
    const result = [];
    let pos = 0;
    let oddDelimIndex = text.indexOf(DELIMITER);
    let evenDelimIndex = text.indexOf(DELIMITER, oddDelimIndex + 1);

    if (evenDelimIndex === -1) {
        result.push(JSON.parse(text));
        return result;
    }

    while (evenDelimIndex !== -1) {
        let object = text.slice(pos, evenDelimIndex);
        result.push(JSON.parse(object));
        pos = evenDelimIndex + 1;
        oddDelimIndex = text.indexOf(DELIMITER, pos);
        evenDelimIndex = text.indexOf(DELIMITER, oddDelimIndex + 1);
    }

    let object = text.slice(pos);
    result.push(JSON.parse(object));
    return result;
}