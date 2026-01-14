const SyncLog = require("../models/SyncLog");

const log = async ({
  entityType,
  entityId,
  hubspotId = null,
  action,
  direction,
  status,
  dataBefore = null,
  dataAfter = null,
  error = null,
  duration = 0,
}) => {
  return SyncLog.create({
    entityType,
    entityId,
    hubspotId,
    action,
    direction,
    status,
    dataBefore,
    dataAfter,
    error: error ? { message: error.message, stack: error.stack } : null,
    duration,
  });
};

const logOutboundSync = async (entityType, entity, status, error = null) => {
  return log({
    entityType,
    entityId: entity._id,
    hubspotId: entity.hubspotId,
    action: entity.hubspotId ? "UPDATE" : "CREATE",
    direction: "OUTBOUND",
    status,
    dataAfter: entity,
    error,
  });
};

const logInboundSync = async (entityType, entity, action, status, error = null) => {
  return log({
    entityType,
    entityId: entity._id,
    hubspotId: entity.hubspotId,
    action,
    direction: "INBOUND",
    status,
    dataAfter: entity,
    error,
  });
};

const logConflict = async (entityType, localId, hubspotId, resolution) => {
  return log({
    entityType,
    entityId: localId,
    hubspotId,
    action: "SYNC",
    direction: "OUTBOUND",
    status: "SUCCESS",
    dataAfter: { resolution, resolvedAt: new Date() },
  });
};

const getAll = async (filters = {}) => {
  const query = {};
  if (filters.entityType) query.entityType = filters.entityType;
  if (filters.status) query.status = filters.status;
  if (filters.direction) query.direction = filters.direction;

  return SyncLog.find(query).sort({ createdAt: -1 }).limit(filters.limit || 100);
};

const getByEntity = async (entityType, entityId) => {
  return SyncLog.find({ entityType, entityId }).sort({ createdAt: -1 });
};

const getStats = async () => {
  const total = await SyncLog.countDocuments();
  const success = await SyncLog.countDocuments({ status: "SUCCESS" });
  const failed = await SyncLog.countDocuments({ status: "FAILED" });
  const inbound = await SyncLog.countDocuments({ direction: "INBOUND" });
  const outbound = await SyncLog.countDocuments({ direction: "OUTBOUND" });

  return { total, success, failed, inbound, outbound };
};

module.exports = {
  log,
  logOutboundSync,
  logInboundSync,
  logConflict,
  getAll,
  getByEntity,
  getStats,
};
