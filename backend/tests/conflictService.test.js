const Conflict = require("../src/models/Conflict");
const Contact = require("../src/models/Contact");

// Mock the HubSpot services to avoid real API calls during tests
jest.mock("../src/hubspotService/contacts", () => ({
    getById: jest.fn().mockResolvedValue({
        properties: {
            firstname: "Michael",
            lastname: "Gary Scott",
            email: "michael@dundermifflin.com",
            phone: "",
            company: "",
        },
    }),
    update: jest.fn().mockResolvedValue({}),
}));

jest.mock("../src/hubspotService/companies", () => ({
    getById: jest.fn().mockResolvedValue({
        properties: {
            name: "Dunder Mifflin",
            domain: "dundermifflin.com",
        },
    }),
    update: jest.fn().mockResolvedValue({}),
}));

const conflictService = require("../src/conflictService/service");

describe("Conflict Service - Unit Tests", () => {
    let localContact;

    beforeEach(async () => {
        localContact = await Contact.create({
            firstname: "Michael",
            lastname: "Scott",
            email: "michael@dundermifflin.com",
            phone: "555-0100",
            company: "Dunder Mifflin",
            hubspotId: "12345",
            syncStatus: "PENDING",
            lastModifiedLocal: new Date(),
        });
    });

    describe("createContactConflict", () => {
        test("should create a conflict record with local and remote snapshots", async () => {
            const remoteData = {
                properties: {
                    firstname: "Michael",
                    lastname: "Gary Scott",
                    email: "michael@dundermifflin.com",
                    phone: "555-0100",
                    company: "Dunder Mifflin",
                },
            };

            await conflictService.createContactConflict(localContact, remoteData);

            const conflicts = await Conflict.find();
            expect(conflicts.length).toBe(1);
            expect(conflicts[0].entityType).toBe("contact");
            expect(conflicts[0].localSnapshot.lastname).toBe("Scott");
            expect(conflicts[0].remoteSnapshot.lastname).toBe("Gary Scott");
            expect(conflicts[0].status).toBe("OPEN");
        });
    });

    describe("detectConflict", () => {
        test("should detect conflict when local record has PENDING status", async () => {
            const hasConflict = await conflictService.detectConflict(
                "contact",
                localContact,
                "12345"
            );

            expect(hasConflict).toBe(true);

            const conflicts = await Conflict.find();
            expect(conflicts.length).toBe(1);

            const updatedContact = await Contact.findById(localContact._id);
            expect(updatedContact.syncStatus).toBe("CONFLICT");
        });

        test("should not detect conflict when local record is not PENDING", async () => {
            localContact.syncStatus = "SYNCED";
            await localContact.save();

            const hasConflict = await conflictService.detectConflict(
                "contact",
                localContact,
                "12345"
            );

            expect(hasConflict).toBe(false);
        });
    });

    describe("resolveKeepLocal", () => {
        test("should resolve conflict by keeping local data", async () => {
            // Create a conflict first
            await conflictService.createContactConflict(localContact, {
                properties: {
                    firstname: "Michael",
                    lastname: "Gary Scott",
                    email: "michael@dundermifflin.com",
                },
            });

            const conflicts = await Conflict.find();
            const conflictId = conflicts[0]._id;

            await conflictService.resolveKeepLocal(conflictId);

            const resolved = await Conflict.findById(conflictId);
            expect(resolved.status).toBe("RESOLVED");
            expect(resolved.resolutionStrategy).toBe("KEEP_LOCAL");

            const contact = await Contact.findById(localContact._id);
            expect(contact.syncStatus).toBe("SYNCED");
            expect(contact.lastname).toBe("Scott");
        });
    });

    describe("resolveMerge - Field Level Merging", () => {
        test("should resolve conflict with custom merged data", async () => {
            await conflictService.createContactConflict(localContact, {
                properties: {
                    firstname: "Michael",
                    lastname: "Gary Scott",
                    email: "michael@dundermifflin.com",
                    phone: "555-9999",
                    company: "Dunder Mifflin Scranton",
                },
            });

            const conflicts = await Conflict.find();
            const conflictId = conflicts[0]._id;

            // Merge: keep local name, take remote phone and company
            const mergedData = {
                firstname: "Michael",
                lastname: "Scott",
                email: "michael@dundermifflin.com",
                phone: "555-9999",
                company: "Dunder Mifflin Scranton",
            };

            await conflictService.resolveMerge(conflictId, mergedData);

            const resolved = await Conflict.findById(conflictId);
            expect(resolved.status).toBe("RESOLVED");
            expect(resolved.resolutionStrategy).toBe("MANUAL_MERGE");

            const contact = await Contact.findById(localContact._id);
            expect(contact.lastname).toBe("Scott");
            expect(contact.phone).toBe("555-9999");
            expect(contact.company).toBe("Dunder Mifflin Scranton");
        });
    });
});
