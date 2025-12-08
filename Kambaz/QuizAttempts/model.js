import mongoose from "mongoose";
import quizAttemptSchema from "./schema.js";

const model = mongoose.model("QuizAttemptModel", quizAttemptSchema);
export default model;