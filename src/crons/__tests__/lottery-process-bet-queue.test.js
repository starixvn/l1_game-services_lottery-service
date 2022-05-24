import { stub, stubMongooseModelStupidly } from "jest-micro-auto-stub";
import mongoose from "mongoose";
import logger from "sc-common/logger";
import { Table } from "sc-game-base";
import { BaseMetrics } from "sc-game-base/src/core/base-metrics";
import { PlaceBetPublisher } from "sc-game-base/src/core/event-publishers";

import gameSettings from "../../game-settings";
import ProcessBetQueue from "../lottery-process-bet-queue";

jest.mock("sc-game-base/src/core/event-publishers");

const definition = new Table.TableGameDefinition(gameSettings);
const gameData = new Table.TableGameData(gameSettings.durations.placingBets - 1);
gameData.exchangeRates = {
    code: {
        US: 1,
    },
};
const placeBetPublisher = new PlaceBetPublisher(definition.name, gameData);

/** @type {logger}*/
const logService = stub(logger);
/** @type {mongoose.Model}*/
const betsRepository = stubMongooseModelStupidly(mongoose.Model);
betsRepository.updateOne = jest.fn();

/** @type {mongoose.Model}*/
const betLogsRepository = stubMongooseModelStupidly(mongoose.Model);
betLogsRepository.create = jest.fn();

/** @type {mongoose.Model}*/
const userInfosRepository = stubMongooseModelStupidly(mongoose.Model);
userInfosRepository.updateOne = jest.fn();

const placeBet = jest.fn();
const baseMetrics = stub(BaseMetrics);

beforeEach(() => {
    gameData.ingame = {
        player01: {
            name: "player01",
            betTracks: { straightUp: { 10: 200, 20: 10 } },
            betQueue: [],
        },
    };
});

describe("proceedBet error tests", () => {
    it("placeBet api return insufficientBalance, should decrease betTrack", async () => {
        placeBet.mockReturnValueOnce({
            isOk: false,
            response: {
                inSufficientBalance: true,
            },
        });

        const proceedBetQueue = initBetQueue();
        const player = mockPlayer();

        await proceedBetQueue.proceedBet(player, mockPayload());
        const { betTracks } = gameData.ingame["player01"];
        expect(betTracks.straightUp[10]).toEqual(150);
        expect(betTracks.straightUp[20]).toEqual(0);
    });

    it("placeBet api return kickedOut, should call handleFailedBet,  should decrease betTrack", async () => {
        placeBet.mockReturnValueOnce({
            isOk: false,
            response: {
                kickedOut: true,
            },
        });

        const proceedBetQueue = initBetQueue();
        const player = mockPlayer();
        await proceedBetQueue.proceedBet(player, mockPayload());

        const { betTracks } = gameData.ingame["player01"];
        expect(betTracks.straightUp[10]).toEqual(150);
        expect(betTracks.straightUp[20]).toEqual(0);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});

describe("successful bet tests", () => {
    beforeEach(() => {
        gameData.roundId = 1;
    });

    it("place bet successfully, insert new betlog, upsert bet, update total bet and call notifyPlacingBetResult", async () => {
        placeBet.mockReturnValueOnce({ isOk: true, response: {} });
        const proceedBetQueue = initBetQueue();

        const player = mockPlayer();
        await proceedBetQueue.proceedBet(player, mockPayload());

        expect(betLogsRepository.create).toHaveBeenCalled();
        expect(betsRepository.updateOne).toHaveBeenCalled();
        expect(placeBetPublisher.publishSuccessBet).toHaveBeenCalled();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});

describe("adjustOwnBets test", () => {
    const testCases = [
        [{}, { betChoice: { special: { 20: 10 } } }, { special: { 20: 10 }, totalAmount: 10 }],
        [
            { special: { 20: 10 }, "4Sets": { 10: 20 }, totalAmount: 30 },
            { betChoice: { special: { 10: 10 } } },
            { special: { 20: 10, 10: 10 }, "4Sets": { 10: 20 }, totalAmount: 40 },
        ],
    ];

    it.each(testCases)("should update ownBets correctly", (ownBets, bet, expectedOwnBets) => {
        gameData.ingame.player = {
            ownBets,
        };
        const proceedBetQueue = initBetQueue();

        proceedBetQueue.adjustOwnBets("player", bet);
        expect(ownBets).toEqual(expectedOwnBets);
    });
});

const initBetQueue = () => {
    return new ProcessBetQueue({
        definition,
        gameData,
        placeBetPublisher,
        placeBet,
        logService,
        betsRepository,
        betLogsRepository,
        userInfosRepository,
        baseMetrics,
    });
};

const mockPlayer = () => {
    return {
        UID: 1,
        profile: { name: "player01", minBet: 1, maxBet: 5000 },
        session: {
            userId: 1,
            memberId: 1,
            siteId: "123456",
            multiplier: 1,
            currencyCode: "US",
        },
        socketClient: {
            emit: jest.fn(),
        },
    };
};

const mockPayload = (roundId = 1, freeBet = false) => {
    return {
        freeBet,
        amount: 100,
        betChoice: {
            straightUp: {
                10: 50,
                20: 10,
            },
        },
        roundId,
    };
};
