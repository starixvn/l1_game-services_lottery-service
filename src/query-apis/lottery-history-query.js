import { HistoryQuery } from "sc-game-base/src/core/query-apis";

export default class LotteryHistoryQuery extends HistoryQuery {
    async queryHistory(player, page, pageSize) {
        if (page < 1 || !player) {
            return {};
        }

        const filter = { uid: player.UID, paid: true };
        const numberOfSkippedBets = (page - 1) * pageSize;
        const total = await this.betsRepository.countDocuments(filter).exec();
        const betProjection = {
            _id: false,
            uid: false,
            paid: false,
            siteId: false,
            playerId: false,
            __v: false,
            __archive: false,
        };
        const bets = await this.betsRepository
            .find(filter, betProjection, { sort: { _id: -1 }, skip: numberOfSkippedBets, limit: pageSize })
            .lean()
            .exec();
        let betLogs = [];

        if (bets && bets.length > 0) {
            betLogs = await Promise.all(
                bets.map(async (bet) => {
                    bet.phien = bet.roundId;

                    const round = await this.roundQuery.getOne(bet.roundId, { _id: false });
                    const betLogDetails = this.betLogsRepository ? await this.getBetLogDetails(player, bet.roundId) : [];

                    return {
                        ...this.convertBet(bet),
                        result: round.result,
                        settlementResult: round.settlementResult,
                        betLogDetails,
                    };
                })
            );
        }

        return { history: { betLogs, page, pageSize, total } };
    }

    getBetLogDetails(player, roundId) {
        return this.betLogsRepository
            .find({ roundId, uid: player.UID }, { _id: false, time: true, choices: true }, { sort: { _id: -1 } })
            .lean()
            .exec();
    }
}
