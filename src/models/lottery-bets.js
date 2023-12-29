import mongoose from "mongoose";

const choiceSchema = new mongoose.Schema(
    {
        "4Sets": { type: Object },
        special: { type: Object },
        head: { type: Object },
        tail: { type: Object },
        "27Sets": { type: Object },
        parlay2: { type: Object },
        parlay3: { type: Object },
        parlay4: { type: Object },
        others: { type: Object },
    },
    { _id: false }
);

const schema = new mongoose.Schema({
    uid: { type: String, required: true },
    name: { type: String, required: true },

    choices: choiceSchema,

    totalAmount: { type: Number, required: true },
    betwin: { type: Number, default: 0 },
    time: { type: Date },
    odds: { type: Object },

    siteId: { type: String },
    freeBet: { type: Boolean, default: false },

    currency: { type: String, required: true },
    rate: { type: Number, required: true },

    operatorId: { type: String, required: true },
    roundId: { type: Number, required: true },
    paid: { type: Boolean, default: false },
    playerId: { type: String },
});

const betLogsSchema = new mongoose.Schema({
    uid: { type: String, required: true },
    name: { type: String, required: true },

    choices: choiceSchema,

    time: { type: Date },
    siteId: { type: String },
    freeBet: { type: Boolean, default: false },

    currency: { type: String, required: true },
    rate: { type: Number, required: true },
    playerId: { type: String },

    operatorId: { type: String, required: true },
    roundId: { type: Number, required: true },
});

const LotteryBetLogs = mongoose.model("lottery_cuoc", betLogsSchema);

const LotteryBets = mongoose.model("lottery_one", schema);

export { LotteryBets, LotteryBetLogs };
