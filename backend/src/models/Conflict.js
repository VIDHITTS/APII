const mongoose = require("mongoose");

const ConflictSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ["contact", "company"],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "entityType",
    },
    hubspotId: {
      type: String,
      required: true,
    },
    localData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    hubspotData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    localModifiedAt: {
      type: Date,
      required: true,
    },
    hubspotModifiedAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "RESOLVED_LOCAL", "RESOLVED_HUBSPOT", "RESOLVED_MANUAL", "DISMISSED"],
      default: "PENDING",
    },
    resolvedBy: {
      type: String,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolution: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ConflictSchema.index({ status: 1 });
ConflictSchema.index({ entityType: 1, entityId: 1 });
ConflictSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Conflict", ConflictSchema);
