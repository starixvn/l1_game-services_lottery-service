import LotteryStatisticConsumer from "../lottery-statistic-consumer";
import * as data from "./lottery-statistic-consumer-data";

describe("updateStats test", () => {
    it("should handle first settlement result normally", () => {
        // arrange
        const statistic = new LotteryStatisticConsumer({ totalRounds: 100, totalOfOthersStats: 20 }, null);
        const settlementResult = data.FirstSettlementResult;

        // act
        const stats = statistic.addNewRound(settlementResult);

        // assert
        expect(stats.head).toBeArray();
    });

    it("should handle multiple settlement result normally", () => {
        // arrange
        const statistic = new LotteryStatisticConsumer({ totalRounds: 100, totalOfOthersStats: 20 }, null);
        // act
        statistic.addNewRound(data.FirstSettlementResult);
        const stats = statistic.addNewRound(data.SecondSettlementResult);

        // assert
        expect(stats.head).toBeArray();
    });

    it("should return 10 hot numbers", () => {
        // arrange
        const statistic = new LotteryStatisticConsumer({ totalRounds: 100, totalOfOthersStats: 20 }, null);

        for (let index = 0; index < 30; index++) {
            statistic.addNewRound(data.FirstSettlementResult);
        }

        // act
        const stats = statistic.addNewRound(data.FirstSettlementResult);

        // assert
        expect(Object.keys(stats.hot.parlays).length).toBe(10);
        expect(Object.values(stats.hot.parlays).filter((count) => count > 30).length).toBe(10);
    });
});
