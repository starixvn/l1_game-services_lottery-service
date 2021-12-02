import { GameData } from "sc-game-base/src/core";
import BaseEventPublisher from "sc-game-base/src/core/event-publishers/base-event-publisher";
import gameSettings from "../../game-settings";
import LotteryGameDefinition from "../../lottery-game-definition";
import LotteryPlaceBetConsumer from "../lottery-place-bet-consumer";

jest.mock("sc-game-base/src/core/event-publishers/base-event-publisher");

let gameData = null;
let definition = null;

const initPlaceBetConsumer = () => {
    return new LotteryPlaceBetConsumer(definition, gameData, new BaseEventPublisher());
};

beforeEach(() => {
    gameData = new GameData(gameSettings.durations.wholeRound);
    gameData.gameConfigs = {
        enabled: true,
    };
    gameData.currencyGroupGames = [
        {
            groupId: "g1",
            minBet: 1,
            maxBet: 2000,
            maxBetPerChoices: {
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
        },
    ];
    definition = new LotteryGameDefinition(gameSettings);
});

describe("adjustPayload test", () => {
    it("should convert all float numbers to integer", () => {
        const payload = {
            betChoice: {
                "4Sets": {
                    10: 1.2,
                    20: 1,
                },
            },
        };

        const placeBetConsumer = initPlaceBetConsumer();

        placeBetConsumer.adjustPayload(payload);
        expect(payload.betChoice["4Sets"][10]).toEqual(1);
        expect(payload.freeBet).toBeFalse();
    });
});

describe("adjustBetTracks test", () => {
    const testCases = [
        [{}, { betChoice: { special: { 20: 10 } } }, { special: { 20: 10 }, totalAmount: 10 }],
        [
            { special: { 20: 10 }, "4Sets": { 10: 20 }, totalAmount: 30 },
            { betChoice: { special: { 10: 10 } } },
            { special: { 20: 10, 10: 10 }, "4Sets": { 10: 20 }, totalAmount: 40 },
        ],
    ];

    it.each(testCases)("should update betTracks correctly", (betTracks, bet, expectedBetTracks) => {
        gameData.ingame.player = {
            betTracks,
        };
        const consumer = initPlaceBetConsumer();

        consumer.adjustBetTracks("player", bet);
        expect(betTracks).toEqual(expectedBetTracks);
    });
});

describe("composeBetChoiceValidationCriteria test", () => {
    it("invalid bet type -  return criteron with failure = true", () => {
        const payload = {
            betChoice: {
                invalidBetType: {
                    10: 1.2,
                    20: 1,
                },
            },
        };

        const placeBetConsumer = initPlaceBetConsumer();
        var actualResult = placeBetConsumer.composeBetChoiceValidationCriteria(payload.betChoice);
        expect(actualResult.some((x) => x.failure)).toBeTrue(1);
    });

    it("more than 1 bet types -  return criteron with failure = true", () => {
        const payload = {
            betChoice: {
                "4Sets": {
                    10: 1,
                },
                head: {
                    1: 1,
                },
            },
        };
        const placeBetConsumer = initPlaceBetConsumer();

        var actualResult = placeBetConsumer.composeBetChoiceValidationCriteria(payload.betChoice);
        expect(actualResult.some((x) => x.failure)).toBeTrue();
    });

    it("valid bet - no fail criteron", () => {
        const payload = {
            betChoice: {
                "4Sets": {
                    10: 1,
                },
            },
        };

        const placeBetConsumer = initPlaceBetConsumer();
        var actualResult = placeBetConsumer.composeBetChoiceValidationCriteria(payload.betChoice);
        expect(actualResult.every((x) => !x.failure)).toBeTrue();
    });
});

describe("composeBetAmountValidationCriteria test", () => {
    const realPlayer = {
        profile: {
            minBet: 1,
            maxBet: 3000,
            name: "player01",
        },
        session: {
            currencyGroupId: "g1",
        }
    };

    it("bet has negative amount - return criteron with failure = true", () => {
        const payload = {
            betChoice: {
                "4Sets": {
                    10: -1,
                },
            },
        };

        const placeBetConsumer = initPlaceBetConsumer();
        var actualResult = placeBetConsumer.composeBetAmountValidationCriteria(realPlayer, payload.betChoice, -1, false);
        expect(actualResult.some((x) => x.failure)).toBeTrue();
    });

    it("exceed max bet per type - return criteron with failure = true", () => {
        const payload = {
            betChoice: {
                "4Sets": {
                    10: 100,
                },
            },
        };
        gameData.ingame = {
            player01: {
                betTracks: {
                    "4Sets": {
                        10: 150,
                        20: 50,
                        30: 50,
                    },
                    totalAmount: 250,
                },
            },
        };

        const placeBetConsumer = initPlaceBetConsumer();
        var actualResult = placeBetConsumer.composeBetAmountValidationCriteria(realPlayer, payload.betChoice, 100, false);
        expect(actualResult.some((x) => x.failure)).toBeTrue();
    });

    it("exceed total max bet - return criteron with failure = true", () => {
        const payload = {
            betChoice: {
                "27Sets": {
                    10: 2000,
                },
            },
        };
        gameData.ingame = {
            player01: {
                betTracks: {
                    "4Sets": {
                        10: 50,
                        20: 50,
                        30: 50,
                    },
                    totalAmount: 150,
                },
            },
        };

        const placeBetConsumer = initPlaceBetConsumer();
        var actualResult = placeBetConsumer.composeBetAmountValidationCriteria(realPlayer, payload.betChoice, 2000, false);
        expect(actualResult.some((x) => x.failure)).toBeTrue();
    });
});

describe("consume tests", () => {
    const player = {
        profile: {
            name: "player",
            minBet: 1,
            maxBet: 2000,
        },
        session: {
            currencyGroupId: "g1",
        }
    };
    it("validateBetRequest return true, should push bet to queue", () => {
        const payload = {
            betChoice: {
                special: {
                    10: 100,
                },
            },
        };

        const consumer = initPlaceBetConsumer();
        gameData.remainingTime = definition.durations.placingBets - 1;

        consumer.consume(player, payload);
        expect(gameData.ingame["player"].betQueue).not.toBeEmpty();
    });

    it("validateBetRequest return false, should return", () => {
        const payload = {
            betChoice: {
                special: {
                    10: -1,
                },
            },
        };

        const consumer = initPlaceBetConsumer();

        consumer.consume(player, payload);
        expect(gameData.ingame["player"]).toBeUndefined();
    });
});
