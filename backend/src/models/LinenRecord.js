import mongoose from "mongoose";

const linenRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    items: {
      type: [
        {
          type: String,
          enum: ["Sheet", "Blanket", "Pillowcase", "Towel"],
        },
      ],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one linen item is required",
      },
    },
    dateIssued: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expectedReturnDate: {
      type: Date,
    },
    dateReturned: {
      type: Date,
    },
    damages: {
      type: String,
      trim: true,
      maxlength: 1000,
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

linenRecordSchema.index({ student: 1, dateIssued: -1 });

linenRecordSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const LinenRecord = mongoose.model("LinenRecord", linenRecordSchema);
