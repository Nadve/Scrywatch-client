import { Client } from '$lib/server/api.js';
 
export async function load(){
    return await Client.getCardNames();
}

export const actions = {
    interestCreate: async ({ cookies, request }) => {
        const cookie = cookies.get('Bearer');
        const data = await request.formData();
        const id = data.get('id');
        const finish = data.get('finish');
        const currency = data.get('currency');
        const intention = data.get('intention');

        const interest = {
            cardId: id,
            finish: finish,
            currency: currency,
            intention: intention
        }

        return await Client.createInterest(interest, cookie);
    },
    getCards: async ({ request }) => {
        const data = await request.formData();
        const name = data.get('cardName');

        return { cardsJson: await Client.getCards(name) };
    }
}