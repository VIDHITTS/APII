const Contact = require("../models/Contact");

class ContactService {
  async getAll() {
    return await Contact.find().sort({ createdAt: -1 });
  }

  async getById(id) {
    return await Contact.findById(id);
  }

  async create(data) {
    const contact = new Contact({
      ...data,
      lastModifiedLocal: new Date(),
      syncStatus: "NEW",
    });
    return await contact.save();
  }

  async update(id, data) {
    const contact = await Contact.findById(id);
    if (!contact) return null;

    Object.assign(contact, data);
    contact.lastModifiedLocal = new Date();
    if (contact.hubspotId) {
      contact.syncStatus = "PENDING";
    }

    return await contact.save();
  }

  async remove(id) {
    return await Contact.findByIdAndDelete(id);
  }
}

module.exports = new ContactService();
