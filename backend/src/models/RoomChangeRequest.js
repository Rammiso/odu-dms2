import mongoose from "mongoose";

const roomChangeRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    currentRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    requestedRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
    reason: {
      type: String,
      required: true,
      enum: ["conflict", "maintenance", "health", "other"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    newAssignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
    },
  },
  {
    timestamps: true,
  }
);

roomChangeRequestSchema.index({ student: 1, submittedAt: -1 });

roomChangeRequestSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const RoomChangeRequest = mongoose.model("RoomChangeRequest", roomChangeRequestSchema);
