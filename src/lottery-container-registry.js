import awilix from "awilix";
import { Core } from "sc-game-base";

import LotteryPlaceBetConsumer from "./consumers/lottery-place-bet-consumer";
import { LotteryNumberGenerator } from "./generators";
import { LotteryBetLogs, LotteryBets, LotteryRounds } from "./models";

const { asClass, asValue } = awilix;

export default class LotteryContainerRegistry extends Core.ContainerRegistry {
    register(appConfigs, definition, gameData) {
        this.registerGenerators();
        super.register(appConfigs, definition, gameData);

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
            placeBetConsumer: asClass(LotteryPlaceBetConsumer).singleton(),
        });
    }

    registerGenerators() {
        this.container.register({
            lotteryNumberGenerator: asClass(LotteryNumberGenerator).singleton(),
        });
    }
}
