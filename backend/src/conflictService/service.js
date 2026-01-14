const Conflict = require("../models/Conflict");
const Contact = require("../models/Contact");
const Company = require("../models/Company");
const SyncLog = require("../models/SyncLog");
const hubspotContacts = require("../hubspotService/contacts");
const hubspotCompanies = require("../hubspotService/companies");

const createContactConflict = async (localContact, remoteData) => {
  await Conflict.create({
    entityType: "contact",
    localId: localContact._id,
    hubspotId: localContact.hubspotId,
    localSnapshot: {
      firstname: localContact.firstname,
      lastname: localContact.lastname,
      email: localContact.email,
      phone: localContact.phone,
      company: localContact.company,
    },
    remoteSnapshot: {
      firstname: remoteData.properties.firstname || "",
      lastname: remoteData.properties.lastname || "",
      email: remoteData.properties.email || "",
      phone: remoteData.properties.phone || "",
      company: remoteData.properties.company || "",
    },
    status: "OPEN",
    detectedAt: new Date(),
  });

  await Contact.findByIdAndUpdate(localContact._id, { syncStatus: "CONFLICT" });
};

const createCompanyConflict = async (localCompany, remoteData) => {
  await Conflict.create({
    entityType: "company",
    localId: localCompany._id,
    hubspotId: localCompany.hubspotId,
    localSnapshot: {
      name: localCompany.name,
      domain: localCompany.domain,
      industry: localCompany.industry,
      phone: localCompany.phone,
      address: localCompany.address,
    },
    remoteSnapshot: {
      name: remoteData.properties.name || "",
      domain: remoteData.properties.domain || "",
      industry: remoteData.properties.industry || "",
      phone: remoteData.properties.phone || "",
      address: remoteData.properties.address || "",
    },
    status: "OPEN",
    detectedAt: new Date(),
  });

  await Company.findByIdAndUpdate(localCompany._id, { syncStatus: "CONFLICT" });
};

const detectConflict = async (entityType, localRecord, hubspotId) => {
  if (localRecord.syncStatus !== "PENDING") {
    return false;
  }

  let remoteData;
  if (entityType === "contact") {
    remoteData = await hubspotContacts.getById(hubspotId);
    await createContactConflict(localRecord, remoteData);
  } else {
    remoteData = await hubspotCompanies.getById(hubspotId);
    await createCompanyConflict(localRecord, remoteData);
  }

  return true;
};

const getAll = async (status = null) => {
  const query = status ? { status } : {};
  return Conflict.find(query).sort({ detectedAt: -1 });
};

const getById = async (id) => {
  return Conflict.findById(id);
};

const resolve = async (conflictId, resolutionStrategy, finalData, pushToHubSpot = true) => {
  const conflict = await Conflict.findById(conflictId);
  if (!conflict) throw new Error("Conflict not found");

  const { createHash } = require("../syncService/hash");

  if (conflict.entityType === "contact") {
    const updateData = {
      ...finalData,
      syncStatus: "SYNCED",
      lastSyncedHash: createHash(finalData),
      lastModifiedLocal: new Date(),
    };
    await Contact.findByIdAndUpdate(conflict.localId, updateData);

    if (pushToHubSpot) {
      const contact = await Contact.findById(conflict.localId);
      await hubspotContacts.update(conflict.hubspotId, {
        properties: {
          firstname: finalData.firstname,
          lastname: finalData.lastname,
          email: finalData.email,
          phone: finalData.phone,
          company: finalData.company,
        },
      });
    }
  } else {
    const updateData = {
      ...finalData,
      syncStatus: "SYNCED",
      lastSyncedHash: createHash(finalData),
      lastModifiedLocal: new Date(),
    };
    await Company.findByIdAndUpdate(conflict.localId, updateData);

    if (pushToHubSpot) {
      await hubspotCompanies.update(conflict.hubspotId, {
        properties: {
          name: finalData.name,
          domain: finalData.domain,
          industry: finalData.industry,
          phone: finalData.phone,
          address: finalData.address,
        },
      });
    }
  }

  conflict.status = "RESOLVED";
  conflict.resolutionStrategy = resolutionStrategy;
  conflict.resolvedAt = new Date();
  conflict.resolvedData = finalData;
  await conflict.save();

  await SyncLog.create({
    entityType: conflict.entityType,
    entityId: conflict.localId,
    hubspotId: conflict.hubspotId,
    action: "SYNC",
    direction: pushToHubSpot ? "OUTBOUND" : "INBOUND",
    status: "SUCCESS",
    dataBefore: { local: conflict.localSnapshot, remote: conflict.remoteSnapshot },
    dataAfter: { resolution: resolutionStrategy, finalData },
  });

  return conflict;
};

const resolveKeepLocal = async (conflictId) => {
  const conflict = await Conflict.findById(conflictId);
  return resolve(conflictId, "KEEP_LOCAL", conflict.localSnapshot, true);
};

const resolveKeepRemote = async (conflictId) => {
  const conflict = await Conflict.findById(conflictId);
  return resolve(conflictId, "KEEP_REMOTE", conflict.remoteSnapshot, false);
};

const resolveMerge = async (conflictId, mergedData) => {
  return resolve(conflictId, "MANUAL_MERGE", mergedData, true);
};

module.exports = {
  createContactConflict,
  createCompanyConflict,
  detectConflict,
  getAll,
  getById,
  resolve,
  resolveKeepLocal,
  resolveKeepRemote,
  resolveMerge,
};
