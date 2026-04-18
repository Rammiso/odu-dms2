import mongoose from "mongoose";

const passwordResetTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    usedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

passwordResetTokenSchema.index({ user: 1, expiresAt: -1 });

passwordResetTokenSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.token;
    delete ret.__v;
    return ret;
  },
});

export const PasswordResetToken = mongoose.model("PasswordResetToken", passwordResetTokenSchema);
