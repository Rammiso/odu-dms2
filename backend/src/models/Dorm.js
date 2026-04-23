import mongoose from "mongoose";

const dormSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 20,
    },
    location: {
      type: String,
      required: false,
      trim: true,
      maxlength: 200,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    warden: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    floors: {
      type: [Number],
      default: [],
      validate: {
        validator: (value) => value.every((floor) => Number.isInteger(floor) && floor > 0),
        message: "All floor numbers must be positive integers",
      },
    },
  },
  {
    timestamps: true,
  }
);

 

dormSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const Dorm = mongoose.model("Dorm", dormSchema);
