import mongoose from "mongoose";
import { HistoryQuery } from "sc-game-base/src/core/query-apis";

export default class LotteryHistoryQuery extends HistoryQuery {
    getBetLogDetails(player, roundId) {
        return this.betLogsRepository
            .find({ phien: roundId, uid: player.UID }, { _id: false, time: true, choices: true }, { sort: { _id: -1 } })
            .lean()
            .exec();
    }
}
