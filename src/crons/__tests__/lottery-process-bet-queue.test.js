import { stub, stubMongooseModelStupidly } from "jest-micro-auto-stub";
import mongoose from "mongoose";
import logger from "sc-common/logger";
import ProcessBetQueue from "../lottery-process-bet-queue";
import gameSettings from "../../game-settings";
import { PlaceBetPublisher } from "sc-game-base/src/core/event-publishers";
import { Table } from "sc-game-base";

jest.mock("sc-game-base/src/core/event-publishers");

const definition = new Table.TableGameDefinition(gameSettings);
const gameData = new Table.TableGameData(gameSettings.durations.placingBets - 1);
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
const validateBalance = jest.fn();

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
    it("validateBalance api return insufficientBalance, should decrease betTrack", async () => {
        validateBalance.mockReturnValueOnce({
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

    it("validateBalance api return kickedOut, should call handleFailedBet,  should decrease betTrack", async () => {
        validateBalance.mockReturnValueOnce({
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
        validateBalance.mockReturnValueOnce({ isOk: true, response: {} });
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
        validateBalance,
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
