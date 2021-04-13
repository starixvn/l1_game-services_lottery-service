import LotteryStatisticConsumer from "../lottery-statistic-consumer";
import * as data from "./lottery-statistic-consumer-data";

describe("updateStats test", () => {
    it("should handle first settlement result normally", () => {
        // arrange
        const statistic = new LotteryStatisticConsumer(100, 20, null, null);
        const settlementResult = data.result1;

        // act
        const stats = statistic.addNewRound(settlementResult);

        // assert
        expect(stats.head).toBeArray();
    });

    it("should handle multiple settlement result normally", () => {
        // arrange
        const statistic = new LotteryStatisticConsumer(100, 20, null, null);
        // act
        statistic.addNewRound(data.result1);
        const stats = statistic.addNewRound(data.result2);

        // assert
        expect(stats.head).toBeArray();
    });

    it("should return 10 hot numbers", () => {
        // arrange
        const statistic = new LotteryStatisticConsumer(15, 20, null, null);

        for (let index = 0; index < 30; index++) {
            statistic.addNewRound(data.result1);
        }

        // act
        const stats = statistic.addNewRound(data.result1);

        // assert
        expect(Object.keys(stats.hot.parlays).length).toBe(10);
        expect(Object.keys(stats.hot.special).length).toBe(10);
        expect(Object.keys(stats.hot.seventh).length).toBe(10);
    });

    it("should return 10 cold numbers", () => {
        // arrange
        const statistic = new LotteryStatisticConsumer(15, 20, null, null);

        for (let index = 0; index < 30; index++) {
            statistic.addNewRound(data.result1);
        }

        // act
        const stats = statistic.addNewRound(data.result1);

        // assert
        expect(Object.keys(stats.cold.parlays).length).toBe(10);
        expect(Object.keys(stats.cold.special).length).toBe(10);
        expect(Object.keys(stats.cold.seventh).length).toBe(10);
    });

    it("total values of head, tail, special should be correct", () => {
        // arrange
        const statistic = new LotteryStatisticConsumer(100, 20, null, null);

        for (let index = 0; index < 30; index++) {
            if (index % 2 === 0) {
                statistic.addNewRound(data.result2);
            } else {
                statistic.addNewRound(data.result1);
            }
        }

        // act
        const stats = statistic.addNewRound(data.result1);

        // assert
        expect(
            stats.head.reduce((total, current) => {
                return total + current;
            }, 0)
        ).toBe(31);

        expect(
            stats.tail.reduce((total, current) => {
                return total + current;
            }, 0)
        ).toBe(31);

        expect(
            stats.special.reduce((total, current) => {
                return total + current;
            }, 0)
        ).toBe(31);
    });

    it("special minus stats should be correct", () => {
        // arrange
        const statistic = new LotteryStatisticConsumer(2, 20, null, null);

        statistic.addNewRound(data.result1);
        statistic.addNewRound(data.result2);

        // act
        const stats = statistic.addNewRound(data.result3);

        // assert
        expect(
            stats.special.reduce((total, current) => {
                return total + current;
            }, 0)
        ).toBe(2);
    });

    it("4Sets minus stats should be correct", () => {
        // arrange
        const statistic = new LotteryStatisticConsumer(2, 20, null, null);

        statistic.addNewRound(data.result1);
        statistic.addNewRound(data.result2);

        // act
        const stats = statistic.addNewRound(data.result3);

        // assert
        expect(stats.seventh["29"]).toBe(1);
        expect(stats.seventh["70"]).toBe(0);
        expect(stats.seventh["46"]).toBe(2);
        expect(stats.seventh["51"]).toBe(1);
        expect(stats.seventh["84"]).toBe(1);
    });
});
