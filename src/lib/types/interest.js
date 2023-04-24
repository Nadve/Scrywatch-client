import { Currency } from './currency.js';
import { Intention } from './intention.js';

export class Interest {
    constructor(id, intention, card, goal){
        this.id = id;
        this.intention = intention;
        this.card = card;
        this.finish = card.finishes[0];
        this.currency = card.prices[0].currency;
        this.goal = goal;
        this.prices = card.prices[0];
        this.values = Object.values(this.prices.dateValuePairs);
    }

    get average() {
        return this.values.reduce((prev, next) => prev + next, 0) 
             / this.values.length;
    }
    
    get goalValue() {
        let prices = this.card.prices[0];
        if (!prices)
            return 0;

        return this.average + this.goal / 100 * this.average;
    }

    get trend() {
        let prices = this.card.prices[0];
        if (!prices) return 0;

        let priceNow = this.values[this.values.length - 1];
        let priceChange = (priceNow - this.average) / this.average * 100;
        return Math.round(priceChange);
    }

    get trendString() {
        return this.trend + "%";
    }

    getLastPrice(prices) {
        if(!prices) return 0;
        return this.values[this.values.length - 1];
    }

    get trendMeetsGoal() {
        if(this.intention === Intention.Sell){
            return this.trend >= this.goal;
        }
        return this.trend <= this.goal;
    }

    get price() {
        if(this.card.prices.length === 0)
            return '';

        let prices = this.card.prices[0];
        let price = this.getLastPrice(prices);
        if (price === 0)
            return '';

        let currencySymbol = '';
        if (prices.currency === Currency.Eur)
            currencySymbol = '€';

        if (prices.currency === Currency.Usd)
            currencySymbol = '$';

        return currencySymbol + price;
    }

    dataDiff(){
        if(this.card.prices.length === 0)
            return [];

        let datasets = [];
        let dates = Object.keys(this.card.prices[0].dateValuePairs);
        let days = this.getDays(dates[0], new Date());
        datasets.push(this.getPricesDiff(days));
        datasets.push(this.getTrendLine(days));
        datasets.push(this.getGoalLine(days));
        datasets.push(this.getZeroLine(days));

        return {labels: days, datasets: datasets};
    }

    data(){
        if(this.card.prices.length === 0)
            return [];

        let datasets = [];
        let dates = Object.keys(this.card.prices[0].dateValuePairs);
        let days = this.getDays(dates[0], new Date());
        datasets.push(this.getPrices(days));
        datasets.push(this.getTrendLine(days));
        datasets.push(this.getGoalLine(days));
        datasets.push(this.getZeroLine(days));

        return {labels: days, datasets: datasets};
    }

    getPricesDiff(days){
        const prices = this.card.prices[0];
        return {
            label: this.price,
            borderColor: "#36A2EB",
            backgroundColor: "#36A2EB20",
            fill: true,
            lineTension: 0.3,
            order: -2,
            data: this.expandPrices(days, prices.dateValuePairs)
        };
    }

    getPrices(days){
        const prices = this.card.prices[0];
        return {
            label: "price",
            borderColor: "#36A2EB",
            backgroundColor: "#36A2EB20",
            fill: true,
            lineTension: 0.3,
            order: -2,
            data: this.expandPrices(days, prices.dateValuePairs)
        };
    }

    getZeroLine(days){
        return {
            label: "average",
            spanGaps: true,
            borderColor: "#4BC0C0",
            order: -1,
            data: this.constantLine(days.length, this.average)
        }
    }

    getTrendLine(days){
        return {
            label: "trend",
            borderColor: "#FF6384",
            backgroundColor: "#FF638461",
            spanGaps: true,
            fill: 3,
            data: this.constantLine(days.length, this.getLastPrice(this.card.prices[0]))
        };
    }

    getGoalLine(days){
        let order = 0;
        if(Intention.Buy === this.intention){
            if(this.trend <= this.goal){
                order = -1;
            }
        } else{
            if(this.trend >= this.goal){
                order = -1;
            }
        }
        return {
            label: "goal",
            borderColor: "#FF9F40",
            backgroundColor: "#FF9F4061",
            spanGaps: true,
            fill: 3,
            order: order,
            data: this.constantLine(days.length, this.goalValue)
        };
    }

    constantLine(length, value){
        let line = [];
        line[0] = value;
        for(let i = 1; i < length - 1; i++){
            line[i] = null;
        }
        line[length - 1] = value;
        return line;
    }

    getColor(currency){
        switch(currency){
            case Currency.Eur: return 'blue';
            case Currency.Usd: return 'green';
            case Currency.Tix: return 'black';
        }
    }

    expandPrices(days, dateValuePairs) {
        let prices = [];
        let lastPrice = 0;
        let dates = Object.keys(dateValuePairs);
        for (var i = 0, j = 0; i < days.length; i++){
            if (j < dates.length){
                let date = this.getShortDate(new Date(dates[j]));
                if (date === days[i]){
                    lastPrice = this.values[j];
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