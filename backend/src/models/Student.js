import mongoose from "mongoose";

const phoneRegex = /^(\+251|0)?9\d{8}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 30,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    gender: {
      type: String,
      required: true,
      enum: ["M", "F"],
    },
    department: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => phoneRegex.test(value),
        message: "Invalid phone number",
      },
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) => emailRegex.test(value),
        message: "Invalid email format",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

studentSchema.index({ studentId: 1 }, { unique: true });

export const Student = mongoose.model("Student", studentSchema);
