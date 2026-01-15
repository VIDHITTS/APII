const request = require("supertest");
const { createApp } = require("../src/app");
const Contact = require("../src/models/Contact");
const Company = require("../src/models/Company");

// Mock HubSpot services
jest.mock("../src/hubspotService/contacts", () => ({
    create: jest.fn().mockResolvedValue({ id: "hs-contact-123" }),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
}));

jest.mock("../src/hubspotService/companies", () => ({
    create: jest.fn().mockResolvedValue({ id: "hs-company-123" }),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
}));

describe("Sync Operations - Integration Tests", () => {
    let app;

    beforeAll(() => {
        app = createApp();
    });

    describe("Contact Sync Flow", () => {
        test("should create contact locally with NEW status", async () => {
            const res = await request(app)
                .post("/api/contacts")
                .send({
                    email: "dwight@dundermifflin.com",
                    firstname: "Dwight",
                    lastname: "Schrute",
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.syncStatus).toBe("NEW");
        });

        test("should update contact and set PENDING status", async () => {
            const contact = await Contact.create({
                email: "andy@dundermifflin.com",
                firstname: "Andy",
                lastname: "Bernard",
                syncStatus: "SYNCED",
                hubspotId: "hs-123",
                lastModifiedLocal: new Date(),
            });

            const res = await request(app)
                .put(`/api/contacts/${contact._id}`)
                .send({
                    firstname: "Andrew",
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.firstname).toBe("Andrew");
            expect(res.body.syncStatus).toBe("PENDING");
        });
    });

    describe("Company Sync Flow", () => {
        test("should create company locally with NEW status", async () => {
            const res = await request(app)
                .post("/api/companies")
                .send({
                    name: "Vance Refrigeration",
                    domain: "vancerefrigeration.com",
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.syncStatus).toBe("NEW");
        });

        test("should update company and set PENDING status", async () => {
            const company = await Company.create({
                name: "Michael Scott Paper Company",
                domain: "mspc.com",
                syncStatus: "SYNCED",
                hubspotId: "hs-789",
                lastModifiedLocal: new Date(),
            });

            const res = await request(app)
                .put(`/api/companies/${company._id}`)
                .send({
                    name: "Michael Scott Paper Company Inc.",
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe("Michael Scott Paper Company Inc.");
            expect(res.body.syncStatus).toBe("PENDING");
        });
    });
});
