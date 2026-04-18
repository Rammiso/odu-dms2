import mongoose from "mongoose";

const furnitureItemSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    itemName: {
      type: String,
      required: true,
      enum: ["Bed", "Mattress", "Desk", "Chair", "Wardrobe", "Shelf"],
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    condition: {
      type: String,
      enum: ["Good", "Fair", "Damaged", "Missing"],
      default: "Good",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

furnitureItemSchema.index({ roomId: 1, itemName: 1 }, { unique: true });

furnitureItemSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const FurnitureItem = mongoose.model("FurnitureItem", furnitureItemSchema);
