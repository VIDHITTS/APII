const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

module.exports = async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    global.__MONGOSERVER__ = mongoServer;
};

module.exports.teardown = async () => {
    await mongoose.disconnect();
    if (global.__MONGOSERVER__) {
        await global.__MONGOSERVER__.stop();
    }
};
