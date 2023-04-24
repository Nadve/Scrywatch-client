import { writable } from 'svelte/store';

export const cardList = writable([]);
export const searchText = writable("");
export const cardVisible = writable(false);

export const buyList = writable([]);
export const sellList = writable([]);
export const sellInterestIndex = writable(0);
export const buyInterestIndex = writable(0);