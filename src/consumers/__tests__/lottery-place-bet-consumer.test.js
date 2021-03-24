import { GameData } from "sc-game-base/src/core";
import BaseEventPublisher from "sc-game-base/src/core/event-publishers/base-event-publisher";
import gameSettings from "../../game-settings";
import LotteryGameDefinition from "../../lottery-game-definition";
import LotteryPlaceBetConsumer from "../lottery-place-bet-consumer";

jest.mock("sc-game-base/src/core/event-publishers/base-event-publisher");

const gameData = new GameData(10);
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
