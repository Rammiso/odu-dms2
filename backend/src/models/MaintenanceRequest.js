import mongoose from "mongoose";

const maintenanceNoteSchema = new mongoose.Schema(
  {
    note: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    isInternal: {
      type: Boolean,
      default: false,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const maintenanceRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Plumbing", "Electrical", "Furniture", "Sanitation", "Other"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 1500,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
      index: true,
    },
    status: {
      type: String,
      enum: ["Submitted", "In Progress", "Completed", "Rejected"],
      default: "Submitted",
      index: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    resolutionNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    trackingNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    notes: {
      type: [maintenanceNoteSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

maintenanceRequestSchema.index({ submittedAt: -1 });

maintenanceRequestSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const MaintenanceRequest = mongoose.model("MaintenanceRequest", maintenanceRequestSchema);
