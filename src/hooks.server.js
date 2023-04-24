export const handle = async ({ event, resolve }) => {
    const jwt = event.cookies.get('Bearer');

    if (!jwt){
        event.locals.auth = false;
        return await resolve(event);
    }

    event.locals.auth = true;
    return await resolve(event);
}