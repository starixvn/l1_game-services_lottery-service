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

    adjustTotalBets(player, bet) {
        const { betChoice, amount } = bet;
        const betType = Object.keys(betChoice)[0];
        this.gameData.totalBets[betType] = (this.gameData.totalBets[betType] ?? 0) + amount;
    }

    generatePlacingBetResult(player, balance, bet) {
        const { betChoice, amount } = bet;
        const ownBet = super.generatePlacingBetResult(player, balance, bet);

        ownBet.ownChip = { betChoice, amount };

        if (this.gameData.chips) {
            const betTypeKey = Object.keys(betChoice)[0];
            for (const [betChoiceKey, amountOnChoice] of Object.entries(betChoice[betTypeKey])) {
                if (!this.gameData.chips[betTypeKey]) {
                    this.gameData.chips[betTypeKey] = {};
                }
                this.gameData.chips[betTypeKey][betChoiceKey] = this.gameData.chips[betTypeKey][betChoiceKey] ?? {};
                this.gameData.chips[betTypeKey][betChoiceKey][amountOnChoice] =
                    (this.gameData.chips[betTypeKey][betChoiceKey][amountOnChoice] ?? 0) + 1;
            }
        }

        if (this.gameData.players[player.UID]) {
            this.gameData.players[player.UID].red = balance.red;
        }

        return ownBet;
    }
}
