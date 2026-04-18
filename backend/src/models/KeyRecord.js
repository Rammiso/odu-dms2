import mongoose from "mongoose";

const keyRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    keyCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 50,
    },
    dateIssued: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dateReturned: {
      type: Date,
    },
    condition: {
      type: String,
      enum: ["Good", "Damaged", "Missing"],
      default: "Good",
    },
    status: {
      type: String,
      enum: ["Issued", "Returned", "Missing"],
      default: "Issued",
      index: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

keyRecordSchema.index({ keyCode: 1, status: 1 });
keyRecordSchema.index({ student: 1, dateIssued: -1 });

keyRecordSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const KeyRecord = mongoose.model("KeyRecord", keyRecordSchema);
