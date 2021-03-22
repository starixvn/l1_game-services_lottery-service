import awilix from "awilix";
import { Core } from "sc-game-base";

import LotteryPlaceBetConsumer from "./consumers/lottery-place-bet-consumer";
import { LotteryBets, LotteryRounds, LotteryBetLogs } from "./models";

const { asClass, asValue } = awilix;

export default class LotteryContainerRegistry extends Core.ContainerRegistry {
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
}
