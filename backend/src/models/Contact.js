const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    firstname: {
      type: String,
      trim: true,
      default: "",
    },
    lastname: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    company: {
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

ContactSchema.index({ syncStatus: 1 });

module.exports = mongoose.model("Contact", ContactSchema);
