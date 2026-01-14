const hubspotContacts = require("../hubspotService/contacts");
const hubspotCompanies = require("../hubspotService/companies");
const syncService = require("../syncService/service");
const conflictService = require("../conflictService/service");
const Contact = require("../models/Contact");
const Company = require("../models/Company");

const handleContactEvent = async (event) => {
  const { subscriptionType, objectId } = event;

  if (subscriptionType === "contact.deletion") {
    return { action: "DELETED", objectId };
  }

  const localContact = await Contact.findOne({ hubspotId: objectId });

  if (localContact && localContact.syncStatus === "PENDING") {
    const remoteData = await hubspotContacts.getById(objectId);
    await conflictService.createContactConflict(localContact, remoteData);
    return { action: "CONFLICT_DETECTED", objectId };
  }

  const hubspotContact = await hubspotContacts.getById(objectId);
  const result = await syncService.syncContactFromHubSpot(hubspotContact);

  return result;
};

const handleCompanyEvent = async (event) => {
  const { subscriptionType, objectId } = event;

  if (subscriptionType === "company.deletion") {
    return { action: "DELETED", objectId };
  }

  const localCompany = await Company.findOne({ hubspotId: objectId });

  if (localCompany && localCompany.syncStatus === "PENDING") {
    const remoteData = await hubspotCompanies.getById(objectId);
    await conflictService.createCompanyConflict(localCompany, remoteData);
    return { action: "CONFLICT_DETECTED", objectId };
  }

  const hubspotCompany = await hubspotCompanies.getById(objectId);
  const result = await syncService.syncCompanyFromHubSpot(hubspotCompany);

  return result;
};

const processWebhookEvents = async (events) => {
  const results = [];

  for (const event of events) {
    try {
      let result;

      if (event.subscriptionType.startsWith("contact.")) {
        result = await handleContactEvent(event);
      } else if (event.subscriptionType.startsWith("company.")) {
        result = await handleCompanyEvent(event);
      } else {
        result = { action: "IGNORED", reason: "Unknown event type" };
      }

      results.push({ eventId: event.eventId, ...result });
    } catch (error) {
      results.push({
        eventId: event.eventId,
        action: "ERROR",
        error: error.message,
      });
    }
  }

  return results;
};

module.exports = {
  processWebhookEvents,
  handleContactEvent,
  handleCompanyEvent,
};
