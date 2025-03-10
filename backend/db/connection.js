import mongoose from "mongoose";

const connect = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/aiWardrobe');
        console.log('Connected to the database');
    } catch (err) {
        console.log('Could not connect to the database. Error:', err);
    }
};

export default connect;
