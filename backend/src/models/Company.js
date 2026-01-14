const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    domain: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    hubspotId: {
      type: String,
      unique: true,
      sparse: true,
    },
    lastSyncedHash: {
      type: String,
      default: null,
    },
    lastModifiedLocal: {
      type: Date,
      default: Date.now,
    },
    lastModifiedHubSpot: {
      type: Date,
      default: null,
    },
    syncStatus: {
      type: String,
      enum: ["SYNCED", "PENDING", "SYNCING", "FAILED", "CONFLICT", "NEW"],
      default: "NEW",
    },
  },
  {
    timestamps: true,
  }
);

CompanySchema.index({ syncStatus: 1 });
CompanySchema.index({ hubspotId: 1 });
CompanySchema.index({ domain: 1 });

module.exports = mongoose.model("Company", CompanySchema);
