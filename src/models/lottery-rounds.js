import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    special: { type: Array, required: true },
    first: { type: Array, required: true },
    second: { type: Array, required: true },
    third: { type: Array, required: true },
    fourth: { type: Array, required: true },
    fifth: { type: Array, required: true },
    sixth: { type: Array, required: true },
    seventh: { type: Array, required: true },
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
