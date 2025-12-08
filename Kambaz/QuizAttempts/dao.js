import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export default function QuizAttemptsDao() {

  // Find all attempts for a user on a specific quiz
  async function findAttemptsForUserQuiz(userId, quizId) {
    return model.find({ user: userId, quiz: quizId }).sort({ attemptNumber: -1 });
  }

  // Find the latest attempt for a user on a specific quiz
  async function findLatestAttempt(userId, quizId) {
    return model.findOne({ user: userId, quiz: quizId }).sort({ attemptNumber: -1 });
  }

  // Find an in-progress attempt
  async function findInProgressAttempt(userId, quizId) {
    return model.findOne({ 
      user: userId, 
      quiz: quizId, 
      status: "IN_PROGRESS" 
    });
  }

  // Get attempt count for a user on a quiz
  async function getAttemptCount(userId, quizId) {
    return model.countDocuments({ user: userId, quiz: quizId, status: { $ne: "IN_PROGRESS" } });
  }

  // Start a new attempt
  async function startAttempt(userId, quizId, courseId) {
    // Get the next attempt number
    const attemptCount = await getAttemptCount(userId, quizId);
    
    const attempt = {
      _id: uuidv4(),
      user: userId,
      quiz: quizId,
      course: courseId,
      attemptNumber: attemptCount + 1,
      startedAt: new Date(),
      answers: [],
      status: "IN_PROGRESS",
    };
    
    return model.create(attempt);
  }

  // Save an answer during the quiz
  async function saveAnswer(attemptId, answer) {
    const attempt = await model.findOne({ _id: attemptId });
    if (!attempt) return null;
    
    // Find if answer already exists for this question
    const existingIndex = attempt.answers.findIndex(
      a => a.questionId === answer.questionId
    );
    
    if (existingIndex >= 0) {
      attempt.answers[existingIndex] = answer;
    } else {
      attempt.answers.push(answer);
    }
    
    await attempt.save();
    return attempt;
  }

  // Submit the quiz attempt with grading
async function submitAttempt(attemptId, gradedAnswers, score, totalPoints, status = "SUBMITTED") {
  await model.updateOne(
    { _id: attemptId },
    { 
      $set: { 
        answers: gradedAnswers,
        score,
        totalPoints,
        percentage: totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0,
        submittedAt: new Date(),
        status,
      } 
    }
  );
  // Return the updated attempt
  return model.findOne({ _id: attemptId });
}

  // Find attempt by ID
  async function findAttemptById(attemptId) {
    return model.findOne({ _id: attemptId });
  }

  // Find all attempts for a quiz (for faculty to view)
  async function findAllAttemptsForQuiz(quizId) {
    return model.find({ quiz: quizId, status: { $ne: "IN_PROGRESS" } })
      .sort({ submittedAt: -1 });
  }

  return {
    findAttemptsForUserQuiz,
    findLatestAttempt,
    findInProgressAttempt,
    getAttemptCount,
    startAttempt,
    saveAnswer,
    submitAttempt,
    findAttemptById,
    findAllAttemptsForQuiz,
  };
}