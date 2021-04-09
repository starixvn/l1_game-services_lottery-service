import { GameData } from "sc-game-base/src/core";
import BaseEventPublisher from "sc-game-base/src/core/event-publishers/base-event-publisher";
import gameSettings from "../../game-settings";
import LotteryGameDefinition from "../../lottery-game-definition";
import LotteryPlaceBetConsumer from "../lottery-place-bet-consumer";

jest.mock("sc-game-base/src/core/event-publishers/base-event-publisher");

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
};
const definition = new LotteryGameDefinition(gameSettings);
const placeBetConsumer = new LotteryPlaceBetConsumer(definition, gameData, new BaseEventPublisher());

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

        placeBetConsumer.adjustPayload(payload);
        expect(payload.betChoice["4Sets"][10]).toEqual(1);
        expect(payload.freeBet).toBeFalse();
    });
});

describe("adjustBetTracks test", () => {
    it("should add all bet choice amount to betTracks ", () => {
        const playerName = "player01";
        const payload = {
            betChoice: {
                "4Sets": {
                    10: 1,
                    20: 1,
                },
            },
        };

        gameData.ingame = {
            [playerName]: {
                betTracks: {
                    "4Sets": {
                        10: 1,
                    },
                    totalAmount: 1,
                },
            },
        };
        placeBetConsumer.adjustBetTracks(playerName, payload);

        const { betTracks } = gameData.ingame[playerName];
        expect(betTracks["4Sets"][10]).toEqual(2);
        expect(betTracks["4Sets"][20]).toEqual(1);
        expect(betTracks.totalAmount).toEqual(3);
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
    };

    it("bet has negative amount - return criteron with failure = true", () => {
        const payload = {
            betChoice: {
                "4Sets": {
                    10: -1,
                },
            },
        };

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

        var actualResult = placeBetConsumer.composeBetAmountValidationCriteria(realPlayer, payload.betChoice, 2000, false);
        expect(actualResult.some((x) => x.failure)).toBeTrue();
    });
});
