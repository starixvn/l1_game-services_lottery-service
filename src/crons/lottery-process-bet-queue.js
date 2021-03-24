import { ProcessBetQueue } from "sc-game-base/src/core/crons";

export default class LotteryProcessBetQueue extends ProcessBetQueue {
    formatApiBetInfo(payload) {
        return {
            amount: payload.amount,
            gameId: this.definition.id,
            gameRoundId: this.gameData.roundId,
            freeBet: payload.freeBet,
        };
    }

    async insertBetLog(player, roundId, bet) {
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
        }

        await this.betLogsRepository.create(newBetLog);
    }

    async upsertBet(player, roundId, bet) {
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
        }

        await this.betsRepository.updateOne(
            existingBetFilter,
            { $inc: existingBetIncrement, $setOnInsert: newBet },
            { upsert: true, setDefaultsOnInsert: true }
        );
    }

    buildBetAmountIncrement(bet) {
        const increment = {};

        Object.entries(bet).forEach(([betTypes, choicesPerType]) => {
            Object.entries(choicesPerType).forEach(([betChoice, amount]) => {
                increment[`choices.${betTypes}.${betChoice}`] = amount;
            });
        });

        return increment;
    }

    calculateTotalBetAmount(bet) {
        let total = 0;
        const betTypeObj = Object.values(bet)[0];
        for (const amount of Object.values(betTypeObj)) {
            total += amount;
        }

        return total;
    }

    decreaseBetTracks(playerName, bet) {
        const { betChoice } = bet;
        const betType = Object.keys(betChoice)[0];

        if (this.gameData.ingame?.[playerName]) {
            const { betTracks } = this.gameData.ingame[playerName];
            for (const [choice, amountOnChoice] of Object.entries(betChoice[betType])) {
                betTracks[betType][choice] -= amountOnChoice;
                betTracks.totalAmount -= amountOnChoice;
            }
        }
    }

    adjustTotalBets(player, bet) {
        const { betChoice, amount } = bet;
        const betType = Object.keys(betChoice)[0];
        this.gameData.totalBets[betType] = (this.gameData.totalBets[betType] ?? 0) + amount;
    }
}
