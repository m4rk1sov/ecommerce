// Create indexes for better performance
db = db.getSiblingDB('ecommerce');

// Users collection
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "created_at": -1 });

// Products collection
db.products.createIndex({ "name": "text", "description": "text", "tags": "text" });
db.products.createIndex({ "category": 1 });
db.products.createIndex({ "price": 1 });
db.products.createIndex({ "rating": -1 });
db.products.createIndex({ "created_at": -1 });

// Interactions collection
db.interactions.createIndex({ "user_id": 1, "timestamp": -1 });
db.interactions.createIndex({ "product_id": 1, "timestamp": -1 });
db.interactions.createIndex({ "user_id": 1, "product_id": 1 });
db.interactions.createIndex({ "type": 1 });
db.interactions.createIndex({ "timestamp": -1 });

// Purchases collection
db.purchases.createIndex({ "user_id": 1, "created_at": -1 });
db.purchases.createIndex({ "status": 1 });

print("MongoDB indexes created successfully!");
