const mongoose = require("mongoose");

const ConflictSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ["contact", "company"],
      required: true,
    },
    localId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    hubspotId: {
      type: String,
      required: true,
    },
    localSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    remoteSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ["OPEN", "RESOLVED"],
      default: "OPEN",
    },
    resolutionStrategy: {
      type: String,
      enum: ["KEEP_LOCAL", "KEEP_REMOTE", "MANUAL_MERGE", null],
      default: null,
    },
    resolvedData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    detectedAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ConflictSchema.index({ status: 1 });
ConflictSchema.index({ entityType: 1, localId: 1 });
ConflictSchema.index({ detectedAt: -1 });

module.exports = mongoose.model("Conflict", ConflictSchema);
