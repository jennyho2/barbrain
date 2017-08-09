var mongodb = require("mongodb");
const connectionUrl = process.env.MONGODB_URI;

class Database {
    
    connect(){
        if(this.db) return Promise.resolve(this.db);
        
        return new Promise((resolve, reject) => {
            
            // Connect to the database before starting the application server.
            mongodb.MongoClient.connect(connectionUrl, (err, database) => {
              if (err) {
                console.log(err);
                reject(err);
              }
            
              // Save database object from the callback for reuse.
              this.db = database;
              console.log("Database connection ready");
                resolve(this.db);
            });
        });

    }
}

module.exports = new Database();