import { MongoClient, Db } from 'mongodb';
import { mongodb } from '../azure-credentials';

const dbName = 'groupme-analytics';
let dbClient: MongoClient;
let db: Db;

const getDb = (): Promise<Db> => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(
      mongodb.connectionString,
      (err, client) => {
        if (err) {
          console.log(`Failed to connect to the database: ${err}`);
          reject(err);
        }

        console.log('Connected successfully to the database');
        dbClient = client;
        resolve(dbClient.db(dbName));
      }
    );
  });
};

export const shutdownDB = () => {
  dbClient.close();
};

export default getDb();
