import { GameData } from "sc-game-base/src/core";
import gameSettings from "../../game-settings";
import { LotteryNumberGenerator } from "../../generators";
import generatorDefinition from "../../generators/generator-definition";
import { RandomHelper } from "../../helpers";
import { getSettlementResult } from "../../helpers/result-helper";
import LotteryGameDefinition from "../../lottery-game-definition";
import LotterySettleRoundConsumer from "../lottery-settle-round-consumer";

const gameData = new GameData(10);
gameData.gameConfigs = {
    minbet: 1,
    maxbet: 2000,
    choices_maxbet: {
        "4Sets": 200,
        special: 100,
        head: 500,
        tail: 500,
        "27Sets": 2000,
        parlay2: 200,
        parlay3: 100,
        parlay4: 100,
        others: 2000,
    },
    odds: {
        "4Sets": 24,
        special: 90,
        head: 9,
        tail: 9,
        "27Sets": 3.6,
        parlay2: 13,
        parlay3: 50,
        parlay4: 120,
        others: 1.98,
    },
};
const definition = new LotteryGameDefinition(gameSettings);
const settleRoundConsumer = new LotterySettleRoundConsumer({ definition, gameData });
const lotteryNumberGenerator = new LotteryNumberGenerator(generatorDefinition, RandomHelper);

describe("calculateBetResult test", () => {
    it("4Sets bet test - should calculate win amount and total lost correctly", () => {
        const generatedResult = lotteryNumberGenerator.generate();
        const settlementResult = getSettlementResult(generatedResult);
        const bet = {
            choices: {
                "4Sets": {
                    [settlementResult["4Sets"][0]]: 100,
                    100: 10,
                },
            },
            totalAmount: 110,
            toObject: function () {
                return this;
            },
        };
        const expectedTotalWin = 100 * gameData.gameConfigs.odds["4Sets"] * settlementResult.occurrences.seventh[settlementResult["4Sets"][0]];

        var actualResult = settleRoundConsumer.calculateBetResult(settlementResult, bet, gameData.gameConfigs.odds);

        expect(actualResult.totalWin).toEqual(expectedTotalWin);
        expect(actualResult.winningByChoices["4Sets"]).toEqual(expectedTotalWin);
        expect(actualResult.netWin).toEqual(expectedTotalWin - 100);
        expect(actualResult.totalLost).toEqual(10);
    });

    it("special bet test - should calculate win amount and total lost correctly", () => {
        const generatedResult = lotteryNumberGenerator.generate();
        const settlementResult = getSettlementResult(generatedResult);
        const bet = {
            choices: {
                special: {
                    [settlementResult.special]: 50,
                    100: 10,
                },
            },
            totalAmount: 60,
            toObject: function () {
                return this;
            },
        };
        const expectedTotalWin = 50 * gameData.gameConfigs.odds["special"];

        var actualResult = settleRoundConsumer.calculateBetResult(settlementResult, bet, gameData.gameConfigs.odds);

        expect(actualResult.totalWin).toEqual(expectedTotalWin);
        expect(actualResult.winningByChoices["special"]).toEqual(expectedTotalWin);
        expect(actualResult.netWin).toEqual(expectedTotalWin - 50);
        expect(actualResult.totalLost).toEqual(10);
    });

    it("head tail bet test - should calculate win amount and total lost correctly", () => {
        const generatedResult = lotteryNumberGenerator.generate();
        const settlementResult = getSettlementResult(generatedResult);
        const bet = {
            choices: {
                head: {
                    [settlementResult.head]: 10,
                    100: 10,
                },
                tail: {
                    [settlementResult.tail]: 10,
                    100: 10,
                },
            },
            totalAmount: 40,
            toObject: function () {
                return this;
            },
        };
        const expectedTotalWin = 10 * gameData.gameConfigs.odds["head"] + 10 * gameData.gameConfigs.odds["tail"];

        var actualResult = settleRoundConsumer.calculateBetResult(settlementResult, bet, gameData.gameConfigs.odds);

        expect(actualResult.totalWin).toEqual(expectedTotalWin);
        expect(actualResult.netWin).toEqual(expectedTotalWin - 20);
        expect(actualResult.totalLost).toEqual(20);
    });

    it("odd/even bet test - should calculate win amount and total lost correctly", () => {
        const generatedResult = lotteryNumberGenerator.generate();
        const settlementResult = getSettlementResult(generatedResult);
        const bet = {
            choices: {
                others: {
                    odd: 10,
                    even: 10,
                },
            },
            totalAmount: 30,
            toObject: function () {
                return this;
            },
        };
        const expectedTotalWin = 10 * gameData.gameConfigs.odds["others"];

        var actualResult = settleRoundConsumer.calculateBetResult(settlementResult, bet, gameData.gameConfigs.odds);

        expect(actualResult.totalWin).toEqual(expectedTotalWin);
        expect(actualResult.winningByChoices["others"]).toEqual(10 * gameData.gameConfigs.odds["others"]);
        expect(actualResult.netWin).toEqual(expectedTotalWin - 10);
        expect(actualResult.totalLost).toEqual(10);
    });

    it.only("27 sets bet test - should calculate win amount and total lost correctly", () => {
        const generatedResult = lotteryNumberGenerator.generate();
        const settlementResult = getSettlementResult(generatedResult);
        const bet = {
            choices: {
                "27Sets": {
                    [settlementResult["27Sets"][0]]: 10,
                },
            },
            totalAmount: 30,
            toObject: function () {
                return this;
            },
        };
        const expectedTotalWin = 10 * gameData.gameConfigs.odds["27Sets"] * settlementResult.occurrences.all[settlementResult["27Sets"][0]];
        var actualResult = settleRoundConsumer.calculateBetResult(settlementResult, bet, gameData.gameConfigs.odds);

        expect(actualResult.totalWin).toEqual(expectedTotalWin);
        expect(actualResult.winningByChoices["27Sets"]).toEqual(expectedTotalWin);
        expect(actualResult.netWin).toEqual(expectedTotalWin - 10);
        expect(actualResult.totalLost).toEqual(0);
    });
});
