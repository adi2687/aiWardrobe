import dotenv from 'dotenv'
dotenv.config()
import { getTokenFromRequest } from '../utils/tokenHelper.js';
import jwt from 'jsonwebtoken'; 

const test = (req,res) => {
  try { 
    console.log("in the test method")
    const token = getTokenFromRequest(req); 
    console.log("token is ",token)
    if (!token){
        console.log("token is not present")
      return res.json({msg:"authenticate error"}).status(404)
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("decoded is ",decoded)
    // re 
    res.json({msg:decoded}).status(200)
    return decoded.id;
  } catch (err) {
    console.error("Invalid token:", err.message);
    return null;
  }
};

export default test
