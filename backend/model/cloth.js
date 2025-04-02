import mongoose from "mongoose";

const clothSchema = new mongoose.Schema(
  {
    userid:{type:String,require:true},
    username:{type:String,require:true},
    clothImage: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String },
  },
  { timestamps: true }
);

const Cloth = mongoose.model("Cloth", clothSchema);
export default Cloth;
