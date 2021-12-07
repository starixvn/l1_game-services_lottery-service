import { Core, Table } from "sc-game-base";

import appConfigs from "./app-configs";
import gameSettings from "./game-settings";
import { generateResult, getSettlementResult } from "./helpers/result-helper";
import LotteryContainerRegistry from "./lottery-container-registry";
import LotteryGameDefinition from "./lottery-game-definition";

const run = async () => {
    const definition = new LotteryGameDefinition(gameSettings, generateResult, getSettlementResult);
    const gameData = new Table.TableGameData(gameSettings.durations.wholeRound);
    const container = new LotteryContainerRegistry().register(
        appConfigs,
        definition,
        gameData,
        gameSettings.totalRoundsOfStats,
        gameSettings.totalOthersOfStats
    );
    const app = new Core.BaseGameApp("Lottery", appConfigs);

    await app.run();
    await app.startGame(container);
};

run();
