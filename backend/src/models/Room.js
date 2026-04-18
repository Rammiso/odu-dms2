import mongoose from "mongoose";

const roomTypes = ["Single", "Double", "Triple", "Quad", "Suite"];
const roomStatuses = ["Available", "Full", "Maintenance"];

const roomSchema = new mongoose.Schema(
  {
    dormId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dorm",
      required: true,
      index: true,
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    floor: {
      type: Number,
      required: true,
      min: 1,
    },
    type: {
      type: String,
      required: true,
      enum: roomTypes,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },
    currentOccupancy: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: function validateOccupancy(value) {
          return value <= this.capacity;
        },
        message: "currentOccupancy cannot exceed capacity",
      },
    },
    status: {
      type: String,
      enum: roomStatuses,
      default: "Available",
      index: true,
    },
    genderRestriction: {
      type: String,
      enum: ["Male", "Female", "None"],
      default: "None",
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ dormId: 1, roomNumber: 1 }, { unique: true });
roomSchema.index({ status: 1, floor: 1 });

roomSchema.virtual("availableBeds").get(function availableBeds() {
  return Math.max(0, this.capacity - this.currentOccupancy);
});

roomSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const Room = mongoose.model("Room", roomSchema);
