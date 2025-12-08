import mongoose from "mongoose";
import quizSchema from "./schema.js";

const model = mongoose.model("QuizModel", quizSchema);
export default model;