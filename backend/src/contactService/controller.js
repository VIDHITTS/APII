const service = require("./service");
const { addSyncJob } = require("../queueService/queue");

const getAll = async (req, res) => {
  try {
    const contacts = await service.getAll();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const contact = await service.getById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const contact = await service.create(req.body);

    // Auto-sync to HubSpot (Assignment Requirement: line 73-74)
    await addSyncJob("contact-sync", {
      contactId: contact._id.toString(),
      direction: "outbound"
    });

    res.status(201).json(contact);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(400).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const contact = await service.update(req.params.id, req.body);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    // Auto-sync to HubSpot (Assignment Requirement: line 74)
    if (contact.hubspotId) {
      await addSyncJob("contact-sync", {
        contactId: contact._id.toString(),
        direction: "outbound"
      });
    }

    res.json(contact);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const contact = await service.remove(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.json({ message: "Contact deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
