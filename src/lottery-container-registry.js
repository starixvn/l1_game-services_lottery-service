import awilix from "awilix";
import { Table } from "sc-game-base";

import LotteryPlaceBetConsumer from "./consumers/lottery-place-bet-consumer";
import LotterySettleRoundConsumer from "./consumers/lottery-settle-round-consumer";
import LotteryStatisticConsumer from "./consumers/lottery-statistic-consumer";
import LotteryGameCron from "./crons/lottery-game-cron";
import LotteryProcessBetQueue from "./crons/lottery-process-bet-queue";
import { LotteryNumberGenerator } from "./generators";
import generatorDefinition from "./generators/generator-definition";
import { RandomHelper } from "./helpers";
import { LotteryBetLogs, LotteryBets, LotteryRounds } from "./models";
import LotteryHistoryQuery from "./query-apis/lottery-history-query";

const { asClass, asValue } = awilix;

export default class LotteryContainerRegistry extends Table.TableContainerRegistry {
    register(appConfigs, definition, gameData, totalRoundsOfStats, totalOthersOfStats) {
        this.registerGenerators();
        super.register(appConfigs, definition, gameData);

        this.container.register({
            totalRoundsOfStats: asValue(totalRoundsOfStats),
            totalOthersOfStats: asValue(totalOthersOfStats),
        });

        return this.container;
    }

    registerModels() {
        super.registerModels();

        this.container.register({
            roundsRepository: asValue(LotteryRounds),
            betsRepository: asValue(LotteryBets),
            betLogsRepository: asValue(LotteryBetLogs),
        });
    }

    registerConsumers() {
        super.registerConsumers();

        this.container.register({
            settleGameRoundConsumer: asClass(LotterySettleRoundConsumer).singleton().proxy(),
            placeBetConsumer: asClass(LotteryPlaceBetConsumer).singleton(),
            statisticConsumer: asClass(LotteryStatisticConsumer).singleton(),
        });
    }

    registerGenerators() {
        this.container.register({
            lotteryNumberGenerator: asClass(LotteryNumberGenerator).singleton(),
            boardDefinition: asValue(generatorDefinition),
            randomHelper: asValue(RandomHelper),
        });
    }

    registerCrons() {
        super.registerCrons();

        this.container.register({
            gameCron: asClass(LotteryGameCron).singleton().proxy(),
            processBetQueue: asClass(LotteryProcessBetQueue).singleton().proxy(),
        });
    }

    registerApis() {
        super.registerApis();

        this.container.register({
            historyQuery: asClass(LotteryHistoryQuery).singleton(),
        });
    }
}
