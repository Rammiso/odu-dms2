import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
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
    revokedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

refreshTokenSchema.index({ user: 1, expiresAt: -1 });

refreshTokenSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.token;
    delete ret.__v;
    return ret;
  },
});

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
