import { Core } from "sc-game-base";

export default class LotterySocketRouter extends Core.Routers.BaseSocketRouter {
    constructor({
        definition,
        gameData,
        userSignInConsumer,
        inGameConsumer,
        placeBetConsumer,
        userDisconnectConsumer,
        userSignInPublisher,
        historyQuery,
        logService,
        statisticConsumer,
    }) {
        super({
            definition,
            gameData,
            userSignInConsumer,
            inGameConsumer,
            placeBetConsumer,
            userDisconnectConsumer,
            userSignInPublisher,
            historyQuery,
            logService,
        });

        this.statisticConsumer = statisticConsumer;
    }

    init(socketClient) {
        super.init(socketClient);

        this.socketClient.on("stats", this.handleGettingStats.bind(this));
    }

    handleGettingStats(payload) {
        try {
            if (!this.verify()) {
                return;
            }

            this.statisticConsumer.consume(this.gameData.realPlayers[this.socketClient.id], payload);
        } catch (error) {
            this.logService.logError(error);
        }
    }
}
