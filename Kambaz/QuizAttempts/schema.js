import mongoose from "mongoose";

// Schema for individual question answers
const answerSchema = new mongoose.Schema({
  questionId: String,
  questionType: String,
  
  // For MULTIPLE_CHOICE - the selected choice ID
  selectedChoiceId: String,
  
  // For TRUE_FALSE - true or false
  selectedAnswer: Boolean,
  
  // For FILL_IN_BLANK - the text answer(s)
  textAnswers: [String],
  
  // Whether this answer was correct
  isCorrect: { type: Boolean, default: false },
  
  // Points earned for this question
  pointsEarned: { type: Number, default: 0 },
}, { _id: false });

// Main Quiz Attempt schema
const quizAttemptSchema = new mongoose.Schema({
  _id: String,
  quiz: { type: String, required: true },
  user: { type: String, required: true },
  course: { type: String, required: true },
  
  // Attempt info
  attemptNumber: { type: Number, default: 1 },
  
  // Timing
  startedAt: { type: Date, default: Date.now },
  submittedAt: Date,
  
  // Answers
  answers: [answerSchema],
  
  // Score
  score: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  
  // Status
  status: {
    type: String,
    enum: ["IN_PROGRESS", "SUBMITTED", "TIMED_OUT"],
    default: "IN_PROGRESS"
  },
},
{ collection: "quizattempts" }
);

// Compound index to find attempts by user and quiz
quizAttemptSchema.index({ user: 1, quiz: 1 });

export default quizAttemptSchema;