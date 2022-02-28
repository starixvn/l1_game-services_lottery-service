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
    phien: { type: Number, required: true },

    choices: choiceSchema,

    totalAmount: { type: Number, required: true },
    thanhtoan: { type: Boolean, default: false },
    betwin: { type: Number, default: 0 },
    time: { type: Date },
    odds: { type: Object },

    memberId: { type: Number },
    siteId: { type: String },
    freeBet: { type: Boolean, default: false },

    currency: { type: String, require: true },
    rate: { type: Number, require: true },
    partnerId: { type: String, require: true },

    playerId: { type: Number },
    operatorId: { type: String, required: false },
    roundId: { type: Number, default: 0 },
    paid: { type: Boolean, default: false },
});

const betLogsSchema = new mongoose.Schema({
    uid: { type: String, required: true },
    name: { type: String, required: true },
    phien: { type: Number, required: true },

    choices: choiceSchema,

    time: { type: Date },
    memberId: { type: Number },
    siteId: { type: String },
    freeBet: { type: Boolean, default: false },

    currency: { type: String, require: true },
    rate: { type: Number, require: true },
    partnerId: { type: String, require: true },

    playerId: { type: Number },
    operatorId: { type: String, required: false },
    roundId: { type: Number, default: 0 },
});

const LotteryBetLogs = mongoose.model("lottery_cuoc", betLogsSchema);

const LotteryBets = mongoose.model("lottery_one", schema);

export { LotteryBets, LotteryBetLogs };
