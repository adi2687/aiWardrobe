import mongoose from "mongoose";

// Maximum number of connection attempts
const MAX_RETRIES = 3;
let retryCount = 0;

/**
 * Connect to MongoDB with retry logic
 * @param {string} mongoUrl - MongoDB connection string
 * @param {boolean} isRetry - Whether this is a retry attempt
 */
const connect = async (mongoUrl, isRetry = false) => {
    try {
        // Configure Mongoose options
        mongoose.set('strictQuery', false);
        
        // Connection options with increased timeout and keepAlive
        const options = {
            serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
            socketTimeoutMS: 45000, // Socket timeout
            family: 4, // Use IPv4, skip trying IPv6
            maxPoolSize: 10, // Maintain up to 10 socket connections
            connectTimeoutMS: 30000, // Give up initial connection after 30 seconds
            heartbeatFrequencyMS: 10000, // Check connection every 10 seconds
            retryWrites: true,
            w: 'majority'
        };
        
        // Connect with options
        await mongoose.connect(mongoUrl, options);
        console.log('Connected to the database successfully');
        
        // Reset retry count on successful connection
        retryCount = 0;
        
        // Add connection event listeners for better monitoring
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            // Try to reconnect on error if not already reconnecting
            if (mongoose.connection.readyState !== 2) { // 2 = connecting
                handleReconnect(mongoUrl);
            }
        });
        
        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
            handleReconnect(mongoUrl);
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected successfully');
            retryCount = 0; // Reset retry count on successful reconnection
        });
        
    } catch (err) {
        console.error(`MongoDB connection attempt ${retryCount + 1} failed:`, err);
        
        // Implement retry logic
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            const retryDelay = retryCount * 3000; // Exponential backoff: 3s, 6s, 9s
            console.log(`Retrying connection in ${retryDelay / 1000} seconds... (Attempt ${retryCount} of ${MAX_RETRIES})`);
            
            setTimeout(() => {
                connect(mongoUrl, true);
            }, retryDelay);
        } else {
            console.error(`Failed to connect to MongoDB after ${MAX_RETRIES} attempts.`);
            console.error('Please check your connection string, network connectivity, and MongoDB Atlas status.');
            // In production, you might want to exit or implement a circuit breaker pattern
            // process.exit(1);
        }
    }
};

/**
 * Handle reconnection attempts
 * @param {string} mongoUrl - MongoDB connection string
 */
const handleReconnect = (mongoUrl) => {
    if (retryCount < MAX_RETRIES) {
        retryCount++;
        const retryDelay = retryCount * 2000; // 2s, 4s, 6s
        
        console.log(`Attempting to reconnect in ${retryDelay / 1000} seconds... (Attempt ${retryCount} of ${MAX_RETRIES})`);
        
        setTimeout(() => {
            // Only try to reconnect if we're not already connected or connecting
            if (mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 2) {
                connect(mongoUrl, true);
            }
        }, retryDelay);
    } else {
        console.error(`Failed to reconnect to MongoDB after ${MAX_RETRIES} attempts.`);
    }
};

export default connect;
