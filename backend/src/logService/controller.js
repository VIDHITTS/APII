const service = require("./service");

const getAll = async (req, res) => {
  try {
    const { entityType, status, direction, limit } = req.query;
    const logs = await service.getAll({ entityType, status, direction, limit: parseInt(limit) || 100 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getByEntity = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const logs = await service.getByEntity(entityType, entityId);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await service.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAll, getByEntity, getStats };
