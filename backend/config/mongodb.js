const { MongoClient } = require('mongodb');

let mongoClient = null;
let db = null;

async function connectMongoDB() {
    if (mongoClient && db) {
        return db;
    }

    try {
        mongoClient = new MongoClient(process.env.MONGODB_URL);
        await mongoClient.connect();
        db = mongoClient.db('leadenforce');
        console.log('✅ Connected to MongoDB');
        return db;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
}

async function getCollection(collectionName) {
    const database = await connectMongoDB();
    return database.collection(collectionName);
}

module.exports = {
    connectMongoDB,
    getCollection
};
