const request = require("supertest");
const { createApp } = require("../src/app");
const Contact = require("../src/models/Contact");

describe("Contact API Endpoints", () => {
    let app;

    beforeAll(() => {
        app = createApp();
    });

    beforeEach(async () => {
        await Contact.create({
            firstname: "Jim",
            lastname: "Halpert",
            email: "jim@dundermifflin.com",
            syncStatus: "SYNCED",
            lastModifiedLocal: new Date(),
        });
    });

    test("GET /api/contacts should return all contacts", async () => {
        const res = await request(app).get("/api/contacts");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
        expect(res.body[0].email).toBe("jim@dundermifflin.com");
    });

    test("POST /api/contacts should create a new contact", async () => {
        const newContact = {
            firstname: "Pam",
            lastname: "Beesly",
            email: "pam@dundermifflin.com",
            phone: "555-1234",
        };

        const res = await request(app).post("/api/contacts").send(newContact);
        expect(res.statusCode).toBe(201);
        expect(res.body.email).toBe(newContact.email);
    });

    test("GET /api/contacts/:id should return specific contact", async () => {
        const contact = await Contact.findOne({ email: "jim@dundermifflin.com" });
        const res = await request(app).get(`/api/contacts/${contact._id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.lastname).toBe("Halpert");
    });

    test("DELETE /api/contacts/:id should remove contact", async () => {
        const contact = await Contact.findOne({ email: "jim@dundermifflin.com" });
        const res = await request(app).delete(`/api/contacts/${contact._id}`);
        expect(res.statusCode).toBe(200);

        const check = await Contact.findById(contact._id);
        expect(check).toBeNull();
    });
});
