import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export default function QuizzesDao() {

  // Find all quizzes for a course
  async function findQuizzesForCourse(courseId) {
    const quizzes = await model.find({ course: courseId }).sort({ availableDate: 1 });
    return quizzes;
  }

  // Find a single quiz by ID
  async function findQuizById(quizId) {
    return model.findOne({ _id: quizId });
  }

  // Create a new quiz
  async function createQuiz(quiz) {
    const newQuiz = { 
      ...quiz, 
      _id: uuidv4(),
      questions: [],
      points: 0,
      published: false,
    };
    return model.create(newQuiz);
  }

  // Update quiz metadata
  async function updateQuiz(quizId, quizUpdates) {
    // Calculate total points from questions if questions are updated
    if (quizUpdates.questions) {
      quizUpdates.points = quizUpdates.questions.reduce(
        (sum, q) => sum + (q.points || 0), 0
      );
    }
    return model.updateOne({ _id: quizId }, { $set: quizUpdates });
  }

  // Delete a quiz
  async function deleteQuiz(quizId) {
    return model.deleteOne({ _id: quizId });
  }

  // Publish/unpublish a quiz
  async function publishQuiz(quizId, published) {
    return model.updateOne({ _id: quizId }, { $set: { published } });
  }

  // Add a question to a quiz
  async function addQuestion(quizId, question) {
    const questionWithId = { ...question, _id: uuidv4() };
    const quiz = await model.findOne({ _id: quizId });
    if (!quiz) return null;
    
    quiz.questions.push(questionWithId);
    quiz.points = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);
    await quiz.save();
    return quiz;
  }

  // Update a question in a quiz
  async function updateQuestion(quizId, questionId, questionUpdates) {
    const quiz = await model.findOne({ _id: quizId });
    if (!quiz) return null;
    
    const questionIndex = quiz.questions.findIndex(q => q._id === questionId);
    if (questionIndex === -1) return null;
    
    quiz.questions[questionIndex] = { 
      ...quiz.questions[questionIndex].toObject(), 
      ...questionUpdates,
      _id: questionId 
    };
    quiz.points = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);
    await quiz.save();
    return quiz;
  }

  // Delete a question from a quiz
  async function deleteQuestion(quizId, questionId) {
    const quiz = await model.findOne({ _id: quizId });
    if (!quiz) return null;
    
    quiz.questions = quiz.questions.filter(q => q._id !== questionId);
    quiz.points = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);
    await quiz.save();
    return quiz;
  }

  return {
    findQuizzesForCourse,
    findQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    publishQuiz,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  };
}