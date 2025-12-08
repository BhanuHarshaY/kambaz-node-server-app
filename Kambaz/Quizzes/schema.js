import mongoose from "mongoose";

// Schema for individual question choices (for Multiple Choice)
const choiceSchema = new mongoose.Schema({
  _id: String,
  text: String,
  isCorrect: { type: Boolean, default: false },
}, { _id: false });

// Schema for fill-in-the-blank answers
const blankAnswerSchema = new mongoose.Schema({
  _id: String,
  text: String,
}, { _id: false });

// Schema for individual questions
const questionSchema = new mongoose.Schema({
  _id: String,
  title: { type: String, default: "New Question" },
  type: { 
    type: String, 
    enum: ["MULTIPLE_CHOICE", "TRUE_FALSE", "FILL_IN_BLANK"],
    default: "MULTIPLE_CHOICE"
  },
  points: { type: Number, default: 1 },
  question: { type: String, default: "" }, // The question text
  
  // For MULTIPLE_CHOICE questions
  choices: [choiceSchema],
  
  // For TRUE_FALSE questions
  correctAnswer: { type: Boolean, default: true }, // true = True is correct, false = False is correct
  
  // For FILL_IN_BLANK questions - list of acceptable answers
  blankAnswers: [blankAnswerSchema],
}, { _id: false });

// Main Quiz schema
const quizSchema = new mongoose.Schema({
  _id: String,
  title: { type: String, default: "Unnamed Quiz" },
  course: { type: String, required: true },
  description: { type: String, default: "" },
  
  // Quiz settings
  quizType: { 
    type: String, 
    enum: ["Graded Quiz", "Practice Quiz", "Graded Survey", "Ungraded Survey"],
    default: "Graded Quiz"
  },
  assignmentGroup: {
    type: String,
    enum: ["Quizzes", "Exams", "Assignments", "Project"],
    default: "Quizzes"
  },
  
  // Options
  shuffleAnswers: { type: Boolean, default: true },
  timeLimit: { type: Number, default: 20 }, // in minutes
  hasTimeLimit: { type: Boolean, default: true },
  multipleAttempts: { type: Boolean, default: false },
  howManyAttempts: { type: Number, default: 1 },
  showCorrectAnswers: { 
    type: String, 
    enum: ["Immediately", "After Due Date", "Never"],
    default: "After Due Date"
  },
  accessCode: { type: String, default: "" },
  oneQuestionAtATime: { type: Boolean, default: true },
  webcamRequired: { type: Boolean, default: false },
  lockQuestionsAfterAnswering: { type: Boolean, default: false },
  
  // Dates
  dueDate: { type: String, default: "" },
  availableDate: { type: String, default: "" },
  untilDate: { type: String, default: "" },
  
  // Publishing
  published: { type: Boolean, default: false },
  
  // Questions embedded in quiz
  questions: [questionSchema],
  
  // Computed field (will be calculated)
  points: { type: Number, default: 0 },
},
{ collection: "quizzes" }
);

export default quizSchema;