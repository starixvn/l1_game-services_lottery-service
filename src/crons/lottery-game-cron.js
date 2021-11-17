import { BaseGameCron } from "sc-game-base/src/core/crons";

export default class LotteryGameCron extends BaseGameCron {
    constructor({
        definition,
        gameData,
        bot,
        settleGameRoundConsumer,
        gameStatusPublisher,
        runningRoundInfoPublisher,
        logService,
        gameConfigsRepository,
        roundsRepository,
        archiveStatusesRepository,
        notificationRepository,
        statisticConsumer,
        exchangeRatesRepository,
        currencyGroupGamesRepository,
        partnerConfigRepository,
    }) {
        super({
            definition,
            gameData,
            bot,
            settleGameRoundConsumer,
            gameStatusPublisher,
            runningRoundInfoPublisher,
            logService,
            gameConfigsRepository,
            roundsRepository,
            archiveStatusesRepository,
            notificationRepository,
            exchangeRatesRepository,
            currencyGroupGamesRepository,
            partnerConfigRepository,
        });

        this.statisticConsumer = statisticConsumer;
    }

    async start() {
        await this.statisticConsumer.init();
        await super.start();
    }
}
