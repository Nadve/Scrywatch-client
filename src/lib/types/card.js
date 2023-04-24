import { Finish } from './finish.js';
import { Currency } from './currency.js';

export class Card {
    constructor(id, name, rarity,
        collectorNumber, set, face, finishes, prices) {
        this.id = id;
        this.name = name;
        this.rarity = rarity;
        this.collectorNumber = collectorNumber;
        this.set = set;
        this.face = face;
        this.finishes = finishes;
        this.prices = prices;
        this.finish = finishes[0];
        this.currency = Currency.Eur;
    }

    get tixPrices() {
        if (this.finish === Finish.Nonfoil) {
            return this.prices.filter(p =>
                p.currency === Currency.Tix)[0];
        }

        return null;
    }

    get eurPrices() {
        let prices;
        switch (this.finish){
            case Finish.Nonfoil:
                prices = this.prices.filter(p =>
                    p.currency === Currency.Eur &&
                    p.finish === Finish.Nonfoil)[0];
                break;
            case Finish.Foil:
                prices = this.prices.filter(p =>
                    p.currency === Currency.Eur &&
                    p.finish === Finish.Foil)[0];
                break;
            default: return null;
        }

        return prices;
    }

    get usdPrices() {
        let pricesUsd;
        switch (this.finish){
            case Finish.Nonfoil:
                pricesUsd = this.prices.filter(p =>
                    p.currency === Currency.Usd &&
                    p.finish === Finish.Nonfoil)[0];
                break;
            case Finish.Foil:
                pricesUsd = this.prices.filter(p =>
                    p.currency === Currency.Usd &&
                    p.finish === Finish.Foil)[0];
                break;
            case Finish.Etched:
                pricesUsd = this.prices.filter(p =>
                    p.currency === Currency.Usd &&
                    p.finish === Finish.Etched)[0];
                break;
            default: return null;
        }

        return pricesUsd;
    }

    get price() {
        switch (this.currency) {
            case Currency.Eur: return this.eur;
            case Currency.Usd: return this.usd;
            case Currency.Tix: return this.tix;
            default: return 0;
        }
    }

    get tix(){
        if (this.prices.length === 0 ||
            this.tixPrices == null)
            return '';

        let price = this.getLastPrice(this.tixPrices);
        if (price === 0)
            return '';

        return price;
    }

    get eur(){
        if (this.prices.length === 0 ||
            this.eurPrices == null)
            return '';

        let price = this.getLastPrice(this.eurPrices);
        if (price === 0)
            return '';

        return '€' + price;
    }

    get usd(){
        if(this.prices.length === 0 ||
            this.usdPrices == null)
            return '';

        let price = this.getLastPrice(this.usdPrices);
        if (price === 0)
            return '';

        return '$' + price;
    }

    getLastPrice(prices) {
        if (!prices)
            return 0;

        let values = Object.values(prices.dateValuePairs);
        return values[values.length - 1];
    }

    get data(){
        if(this.prices.length === 0)
            return [];

        let datasets = [];
        let dates = Object.keys(this.prices[0].dateValuePairs);
        let days = this.getDays(dates[0], new Date());

        if (this.eurPrices != null)
            datasets.push(this.getPrices(days, this.eurPrices));

        if (this.usdPrices != null)
            datasets.push(this.getPrices(days, this.usdPrices));

        if (this.tixPrices != null)
            datasets.push(this.getPrices(days, this.tixPrices));

        return {labels: days, datasets: datasets};
    }

    getPrices(days, prices){
        let color = this.getColor(prices.currency);
        return {
            label: prices.currency,
            hidden: prices.currency != this.currency,
            fill: true,
            lineTension: 0.3,
            backgroundColor: 'rgba(225, 204,230, .3)',
            borderColor: color,
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: color,
            pointBackgroundColor: color,
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: color,
            pointHoverBorderColor: 'rgba(220, 220, 220,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 1,
            data: this.expandPrices(days, prices.dateValuePairs)
        };
    }

    getColor(currency){
        switch(currency){
            case Currency.Eur: return 'blue';
            case Currency.Usd: return '#2dd024';
            case Currency.Tix: return 'gray';
        }
    }

    expandPrices(days, dateValuePairs) {
        let prices = [];
        let lastPrice = 0;
        let dates = Object.keys(dateValuePairs);
        let values = Object.values(dateValuePairs);
        for (var i = 0, j = 0; i < days.length; i++){
            if (j < dates.length){
                let date = this.getShortDate(new Date(dates[j]));
                if (date === days[i]){
                    lastPrice = values[j];
                    j++;
                }
                prices.push(lastPrice);
            }
            else{
                prices.push(lastPrice);
            }
        }
        return prices;
    }

    getDays(s,e) {
        for(var days=[],d=new Date(s);d<=new Date(e);d.setDate(d.getDate()+1)) {
            days.push(new Date(d));
        }
        return days.map((d) => d = this.getShortDate(d));
    }

    getShortDate(date){
        return date.toISOString().slice(0, 10);
    }
}
