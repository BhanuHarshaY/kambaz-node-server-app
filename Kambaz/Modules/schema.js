import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    _id: String,
    name: String,
    description: String,
    lessons: [{ _id: String, name: String, description: String }],

  }
);
export default schema;

