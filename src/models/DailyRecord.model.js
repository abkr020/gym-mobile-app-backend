import mongoose from "mongoose";

const dailyRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pushups: {
      type: Number,
      default: 0,
    },
    pullups: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const DailyRecord = mongoose.model("DailyRecord", dailyRecordSchema);