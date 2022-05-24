import { ProcessBetQueue } from "sc-game-base/src/core/crons";

export default class LotteryProcessBetQueue extends ProcessBetQueue {
    formatApiBetInfo(payload) {
        return {
            amount: payload.amount,
            gameId: this.definition.id,
            gameRoundId: payload.roundId,
            freeBet: payload.freeBet,
            clientSentTime: payload.time ?? new Date(),
        };
    }

    async insertBetLog(player, roundId, bet, rate) {
        const newBetLog = {
            uid: player.UID,
            name: player.profile.name,
            phien: roundId,
            time: new Date(),
            choices: bet.betChoice,
            freeBet: bet.freeBet,
        };

        if (player.session) {
            newBetLog.memberId = player.session.memberId;
            newBetLog.siteId = player.session.siteId;
            newBetLog.partnerId = player.session.partnerId;
            newBetLog.currency = player.session.currencyName;
            newBetLog.rate = rate;
        }

        await this.betLogsRepository.create(newBetLog);
    }

    async upsertBet(player, roundId, bet, rate) {
        const configs = this.gameData.gameConfigs;
        const newBet = {
            uid: player.UID,
            name: player.profile.name,
            phien: roundId,
            time: new Date(),
            odds: configs.odds,
            freeBet: bet.freeBet,
        };
        const existingBetFilter = { uid: player.UID, phien: roundId };
        const existingBetIncrement = {
            ...this.buildBetAmountIncrement(bet.betChoice),
            totalAmount: bet.amount,
        };

        if (player.session) {
            newBet.memberId = player.session.memberId;
            newBet.siteId = player.session.siteId;
            newBet.partnerId = player.session.partnerId;
            newBet.currency = player.session.currencyName;
            newBet.rate = rate;
        }

        await this.betsRepository.updateOne(
            existingBetFilter,
            { $inc: existingBetIncrement, $setOnInsert: newBet },
            { upsert: true, setDefaultsOnInsert: true }
        );
    }

    buildBetAmountIncrement(bet) {
        const increment = {};

        Object.entries(bet).forEach(([betType, choicesPerType]) => {
            Object.entries(choicesPerType).forEach(([betChoice, amount]) => {
                increment[`choices.${betType}.${betChoice}`] = amount;
            });
        });

        return increment;
    }

    decreaseBetTracks(playerName, bet) {
        const { betChoice } = bet;
        const betTypeKey = Object.keys(betChoice)[0];

        if (this.gameData.ingame?.[playerName]) {
            const { betTracks } = this.gameData.ingame[playerName];
            for (const [choice, amountOnChoice] of Object.entries(betChoice[betTypeKey])) {
                betTracks[betTypeKey][choice] -= amountOnChoice;
                betTracks.totalAmount -= amountOnChoice;
            }
        }
    }

    adjustOwnBets(playerName, bet) {
        const { betChoice } = bet;
        const betTypeKey = Object.keys(betChoice)[0];

        if (this.gameData.ingame?.[playerName]) {
            const playerInGame = this.gameData.ingame[playerName];

            playerInGame.ownBets = playerInGame.ownBets || {};
            playerInGame.ownBets[betTypeKey] = playerInGame.ownBets[betTypeKey] || {};

            for (const [choice, amountOnChoice] of Object.entries(betChoice[betTypeKey])) {
                playerInGame.ownBets[betTypeKey][choice] = (playerInGame.ownBets[betTypeKey][choice] || 0) + amountOnChoice;

                playerInGame.ownBets.totalAmount = (playerInGame.ownBets.totalAmount || 0) + amountOnChoice;
            }
        }
    }

    adjustTotalBets(player, bet, rate) {
        const { betChoice, amount } = bet;
        const betType = Object.keys(betChoice)[0];
        this.gameData.totalBets[betType] = (this.gameData.totalBets[betType] ?? 0) + amount * rate;
    }

    generatePlacingBetResult(player, balance, bet, rate) {
        const { betChoice, amount } = bet;
        const ownBet = super.generatePlacingBetResult(player, balance, bet);

        ownBet.ownChip = { betChoice, amount };

        if (this.gameData.chips) {
            this.gameData.chips[rate] = this.gameData.chips[rate] ?? {};
            const betTypeKey = Object.keys(betChoice)[0];
            for (const [betChoiceKey, amountOnChoice] of Object.entries(betChoice[betTypeKey])) {
                if (!this.gameData.chips[rate][betTypeKey]) {
                    this.gameData.chips[rate][betTypeKey] = {};
                }
                this.gameData.chips[rate][betTypeKey][betChoiceKey] = this.gameData.chips[rate][betTypeKey][betChoiceKey] ?? {};
                this.gameData.chips[rate][betTypeKey][betChoiceKey][amountOnChoice] =
                    (this.gameData.chips[rate][betTypeKey][betChoiceKey][amountOnChoice] ?? 0) + 1;
            }
        }

        if (this.gameData.players[player.UID]) {
            this.gameData.players[player.UID].red = balance.red;
        }

        return ownBet;
    }
}
