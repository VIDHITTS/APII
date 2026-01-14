const mongoose = require("mongoose");

const SyncLogSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ["contact", "company"],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    hubspotId: {
      type: String,
      default: null,
    },
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "SYNC"],
      required: true,
    },
    direction: {
      type: String,
      enum: ["INBOUND", "OUTBOUND"],
      required: true,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "PENDING"],
      required: true,
    },
    dataBefore: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    dataAfter: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    error: {
      message: String,
      code: String,
      stack: String,
    },
    duration: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

SyncLogSchema.index({ entityType: 1, entityId: 1 });
SyncLogSchema.index({ status: 1 });
SyncLogSchema.index({ createdAt: -1 });
SyncLogSchema.index({ direction: 1, status: 1 });

module.exports = mongoose.model("SyncLog", SyncLogSchema);
