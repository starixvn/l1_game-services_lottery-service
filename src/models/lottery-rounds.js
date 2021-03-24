import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    specialPrize: { type: Array, required: true },
    firstPrize: { type: Array, required: true },
    secondPrize: { type: Array, required: true },
    thirdPrize: { type: Array, required: true },
    fourthPrize: { type: Array, required: true },
    fifthPrize: { type: Array, required: true },
    sixthPrize: { type: Array, required: true },
    seventhPrize: { type: Array, required: true },
  },
  { _id: false }
);

const settlementResultSchema = new mongoose.Schema(
  {
    "4Sets": { type: Array, required: true },
    special: { type: String, required: true },
    head: { type: String, required: true },
    tail: { type: String, required: true },
    "27Sets": { type: Array, required: true },
    parlay2: { type: Array, required: true },
    parlay3: { type: Array, required: true },
    parlay4: { type: Array, required: true },
    others: { type: Object, required: true },
  },
  { _id: false }
);

const Schema = new mongoose.Schema({
  id: { type: Number, required: true },
  result: resultSchema,
  settlementResult: settlementResultSchema,
  time: { type: Date, default: new Date() },
});

export default mongoose.model("lottery_phien", Schema);
