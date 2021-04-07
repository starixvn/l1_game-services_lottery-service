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
                    [settlementResult["4Sets"][1]]: 50,
                    100: 10,
                },
            },
            totalAmount: 160,
            toObject: function () {
                return this;
            },
        };
        const expectedTotalWin = 150 * gameData.gameConfigs.odds["4Sets"];

        var actualResult = settleRoundConsumer.calculateBetResult(settlementResult, bet, gameData.gameConfigs.odds);

        expect(actualResult.totalWin).toEqual(expectedTotalWin);
        expect(actualResult.winningByChoices["4Sets"]).toEqual(expectedTotalWin);
        expect(actualResult.netWin).toEqual(expectedTotalWin - 150);
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

    it("parlay bet test - should calculate win amount and total lost correctly", () => {
        const generatedResult = lotteryNumberGenerator.generate();
        const settlementResult = getSettlementResult(generatedResult);
        const bet = {
            choices: {
                parlay2: {
                    [`${settlementResult["27Sets"][0]}-${settlementResult["27Sets"][1]}`]: 10,
                },
                parlay3: {
                    [`${settlementResult["27Sets"][0]}-${settlementResult["27Sets"][1]}-${settlementResult["27Sets"][2]}`]: 10,
                },
                parlay4: {
                    [`${settlementResult["27Sets"][0]}-${settlementResult["27Sets"][1]}-${settlementResult["27Sets"][2]}-${settlementResult["27Sets"][3]}`]: 10,
                },
            },
            totalAmount: 30,
            toObject: function () {
                return this;
            },
        };
        const expectedTotalWin =
            10 * gameData.gameConfigs.odds["parlay2"] + 10 * gameData.gameConfigs.odds["parlay3"] + 10 * gameData.gameConfigs.odds["parlay4"];

        var actualResult = settleRoundConsumer.calculateBetResult(settlementResult, bet, gameData.gameConfigs.odds);

        expect(actualResult.totalWin).toEqual(expectedTotalWin);
        expect(actualResult.winningByChoices["parlay2"]).toEqual(10 * gameData.gameConfigs.odds["parlay2"]);
        expect(actualResult.netWin).toEqual(expectedTotalWin - bet.totalAmount);
        expect(actualResult.totalLost).toEqual(0);
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
            totalAmount: 20,
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
});
