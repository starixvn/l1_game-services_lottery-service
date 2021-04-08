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
});
