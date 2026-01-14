const { Worker } = require("bullmq");
const { connection } = require("./queue");
const syncService = require("../syncService/service");
const Contact = require("../models/Contact");
const Company = require("../models/Company");

const createWorker = () => {
  const worker = new Worker(
    "sync",
    async (job) => {
      console.log(`Processing job: ${job.name} [${job.id}]`);

      switch (job.name) {
        case "contact-sync":
          return handleContactSync(job.data);

        case "company-sync":
          return handleCompanySync(job.data);

        case "pull-all":
          return handlePullAll();

        case "push-pending":
          return handlePushPending();

        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
    },
    {
      connection,
      concurrency: 5,
    }
  );

  worker.on("completed", (job, result) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed: ${err.message}`);
  });

  return worker;
};

const handleContactSync = async ({ contactId, direction }) => {
  if (direction === "outbound") {
    return syncService.syncContactToHubSpot(contactId);
  }
  const contact = await Contact.findById(contactId);
  if (!contact?.hubspotId) throw new Error("Contact has no HubSpot ID");
  const hubspotData = await require("../hubspotService/contacts").getById(contact.hubspotId);
  return syncService.syncContactFromHubSpot(hubspotData);
};

const handleCompanySync = async ({ companyId, direction }) => {
  if (direction === "outbound") {
    return syncService.syncCompanyToHubSpot(companyId);
  }
  const company = await Company.findById(companyId);
  if (!company?.hubspotId) throw new Error("Company has no HubSpot ID");
  const hubspotData = await require("../hubspotService/companies").getById(company.hubspotId);
  return syncService.syncCompanyFromHubSpot(hubspotData);
};

const handlePullAll = async () => {
  const result = await syncService.pullAllFromHubSpot();
  console.log(`Pull complete: ${result.contacts.length} contacts, ${result.companies.length} companies`);
  return result;
};

const handlePushPending = async () => {
  const result = await syncService.syncAllPendingToHubSpot();
  console.log(`Push complete: ${result.contacts.length} contacts, ${result.companies.length} companies`);
  return result;
};

module.exports = { createWorker };
