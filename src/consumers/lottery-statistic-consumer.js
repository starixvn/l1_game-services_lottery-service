export default class LotteryStatisticConsumer {
    constructor(totalRoundsOfStats, totalOthersOfStats, roundsRepository, publisher) {
        this.totalRoundsOfStats = totalRoundsOfStats;
        this.totalOthersOfStats = totalOthersOfStats;
        this.roundsRepository = roundsRepository;
        this.publisher = publisher;

        this.settlementResults = [];
        this.stats = this.initEmptyStats();
        this.specialNumbers = {};
    }

    async init() {
        const rounds = await this.roundsRepository.find({}, { settlementResult: true }, { sort: { id: -1 }, limit: this.totalRoundsOfStats }).lean();
        rounds.reverse();

        rounds.forEach((round) => {
            this.addNewRound(round.settlementResult);
        });
    }

    addNewRound(settlementResult) {
        let lastResult = null;
        this.settlementResults.push(settlementResult);
        const isRemoved = this.settlementResults.length > this.totalRoundsOfStats;

        if (isRemoved) {
            lastResult = this.settlementResults.shift();
        }

        if (this.specialNumbers[settlementResult.special]) {
            this.specialNumbers[settlementResult.special] += 1;
        } else {
            this.specialNumbers[settlementResult.special] = 1;
        }

        this.updateStats(settlementResult, lastResult, isRemoved);

        return this.stats;
    }

    updateStats(firstResult, lastResult, isRemoved) {
        const firstStats = this.extractStatsFromResult(firstResult);
        const lastStats = lastResult ? this.extractStatsFromResult(lastResult) : null;

        Object.keys(firstStats.twoDigitsNumbers).forEach((twoDigits) => {
            const lastCount = isRemoved && lastStats.twoDigitsNumbers[twoDigits] ? lastStats.twoDigitsNumbers[twoDigits] : 0;
            const count = firstStats.twoDigitsNumbers[twoDigits] - lastCount;

            this.stats.twoDigitsNumbers[twoDigits] += count;
        });

        Object.keys(firstStats.seventh).forEach((twoDigits) => {
            const lastCount = isRemoved && lastStats.seventh[twoDigits] ? lastStats.seventh[twoDigits] : 0;
            const count = firstStats.seventh[twoDigits] - lastCount;

            this.stats.seventh[twoDigits] += count;
        });

        Object.keys(firstStats.special).forEach((twoDigits) => {
            const lastCount = isRemoved && lastStats.special[twoDigits] ? lastStats.special[twoDigits] : 0;
            const count = firstStats.special[twoDigits] - lastCount;

            this.stats.special[twoDigits] += count;
        });

        Object.keys(firstStats.head).forEach((headNumber) => {
            const lastCount = isRemoved ? lastStats.head[headNumber] : 0;
            const count = firstStats.head[headNumber] - lastCount;

            this.stats.head[headNumber] += count;
        });

        Object.keys(firstStats.tail).forEach((tailNumber) => {
            const lastCount = isRemoved ? lastStats.tail[tailNumber] : 0;
            const count = firstStats.tail[tailNumber] - lastCount;

            this.stats.tail[tailNumber] += count;
        });

        const { hot, cold } = this.extractHotAndCold(
            this.stats.twoDigitsNumbers,
            this.stats.seventh,
            this.stats.special,
            this.stats.head,
            this.stats.tail
        );

        this.stats.hot = hot;
        this.stats.cold = cold;
        this.stats.othersPercentage = this.extractOthersPercentage();
        this.stats.othersList.push(firstResult.others);

        if (this.stats.othersList.length > this.totalOthersOfStats) {
            this.stats.othersList.pop();
        }
    }

    extractStatsFromResult(settlementResult) {
        const { others, head: headNumber, tail: tailNumber, special: specialNumber } = settlementResult;
        const { all: twoDigits, seventh } = settlementResult.occurrences;
        const stats = this.initEmptyStats();

        Object.keys(twoDigits).forEach((number) => {
            stats.twoDigitsNumbers[number] = twoDigits[number];
        });

        Object.keys(seventh).forEach((number) => {
            stats.seventh[number] = seventh[number];
        });

        stats.others = others;
        stats.head[headNumber] += 1;
        stats.tail[tailNumber] += 1;
        stats.special[specialNumber] += 1;

        return stats;
    }

    initEmptyStats() {
        const stats = {
            head: [],
            tail: [],
            seventh: [],
            special: [],
            twoDigitsNumbers: [],
            others: {
                odd: 0,
                even: 0,
                big: 0,
                small: 0,
            },
            othersList: [],
            othersPercentage: {
                big: 0,
                small: 0,
                odd: 0,
                even: 0,
            },
            hot: {
                special: {},
                parlays: {},
                seventh: {},
                head: {},
                tail: {},
            },
            cold: {
                special: {},
                parlays: {},
                seventh: {},
                head: {},
                tail: {},
            },
        };

        this.initHeadTail(stats);
        this.initSets(stats);

        return stats;
    }

    initHeadTail(stats) {
        for (let index = 0; index < 10; index++) {
            stats.head[index] = 0;
            stats.tail[index] = 0;
        }
    }

    initSets(stats) {
        for (let index = 0; index < 100; index++) {
            const number = index < 10 ? "0".concat(index) : "" + index;
            stats.twoDigitsNumbers[number] = 0;
            stats.special[number] = 0;
            stats.seventh[number] = 0;
        }
    }

    extractHotAndCold(twoDigits, seventh, special, head, tail) {
        const stats = {
            hot: {
                special: {},
                parlays: {},
                seventh: {},
                head: {},
                tail: {},
            },
            cold: {
                special: {},
                parlays: {},
                seventh: {},
                head: {},
                tail: {},
            },
        };

        const { hot: hotParlay, cold: coldParlay } = this.extractHotColdNumbers(twoDigits);
        stats.hot.parlays = hotParlay;
        stats.cold.parlays = coldParlay;

        const { hot: hot4Sets, cold: cold4Sets } = this.extractHotColdNumbers(seventh);
        stats.hot.seventh = hot4Sets;
        stats.cold.seventh = cold4Sets;

        const { hot: hotSpecial, cold: coldSpecial } = this.extractHotColdNumbers(special);
        stats.hot.special = hotSpecial;
        stats.cold.special = coldSpecial;

        const { hot: hotHead, cold: coldHead } = this.extractHotColdNumbersOfHeadTail(head);
        stats.hot.head = hotHead;
        stats.cold.head = coldHead;

        const { hot: hotTail, cold: coldTail } = this.extractHotColdNumbersOfHeadTail(tail);
        stats.hot.tail = hotTail;
        stats.cold.tail = coldTail;

        return stats;
    }

    sortDictionary(twoDigits) {
        const items = Object.keys(twoDigits).map(function (key) {
            return [key, twoDigits[key]];
        });

        items.sort(function (first, second) {
            return second[1] - first[1];
        });

        return items;
    }

    extractHotColdNumbers(twoDigitsNumbers) {
        const items = this.sortDictionary(twoDigitsNumbers);

        const hot = items.slice(0, 10).reduce((list, item) => {
            if (item[1] > 10) {
                list[item[0]] = item[1];
            }

            return list;
        }, {});

        const cold = items.slice(items.length - 10, items.length).reduce((list, item) => {
            if (item[0] < 10) {
                list[item[0]] = item[1];
            }

            return list;
        }, {});

        return { hot, cold };
    }

    extractHotColdNumbersOfHeadTail(items) {
        const hot = {};
        const cold = {};

        for (let index = 0; index < items.length; index++) {
            const count = items[index];

            if (count > 10) {
                hot[index] = count;
            } else {
                cold[index] = count;
            }
        }

        return { hot, cold };
    }

    extractOthersPercentage() {
        const percentage = {
            big: 0,
            small: 0,
            odd: 0,
            even: 0,
        };

        const bigOddCounts = this.settlementResults.reduce(
            (counter, item) => {
                counter.big += item.others.big ? 1 : 0;
                counter.odd += item.others.odd ? 1 : 0;

                return counter;
            },
            { big: 0, odd: 0 }
        );

        const totalRoundsOfStats = this.settlementResults.length;

        percentage.big = Math.round((bigOddCounts.big / totalRoundsOfStats) * 100);
        percentage.small = 100 - percentage.big;
        percentage.odd = Math.round((bigOddCounts.odd / totalRoundsOfStats) * 100);
        percentage.even = 100 - percentage.odd;

        return percentage;
    }

    consume(player, payload) {
        const { hot, cold, othersPercentage } = this.stats;

        this.publisher.publishToUser(player.UID, {
            stats: {
                othersPercentage,
                hot,
                cold,
            },
        });
    }
}
