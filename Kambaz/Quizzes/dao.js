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
      questionGroups: [],
      points: 0,
      published: false,
    };
    return model.create(newQuiz);
  }

  // Helper function to calculate total points (including question groups)
  function calculateTotalPoints(quiz) {
    const questionPoints = (quiz.questions || []).reduce((sum, q) => sum + (q.points || 0), 0);
    const groupPoints = (quiz.questionGroups || []).reduce((groupSum, group) => {
      const questionsToCount = group.pickCount || group.questions.length;
      return groupSum + (questionsToCount * (group.pointsPerQuestion || 0));
    }, 0);
    return questionPoints + groupPoints;
  }

  // Update quiz metadata
  async function updateQuiz(quizId, quizUpdates) {
    // Calculate total points from questions and groups if they are updated
    if (quizUpdates.questions || quizUpdates.questionGroups) {
      quizUpdates.points = calculateTotalPoints(quizUpdates);
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
    quiz.points = calculateTotalPoints(quiz);
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
    quiz.points = calculateTotalPoints(quiz);
    await quiz.save();
    return quiz;
  }

  // Delete a question from a quiz
  async function deleteQuestion(quizId, questionId) {
    const quiz = await model.findOne({ _id: quizId });
    if (!quiz) return null;

    quiz.questions = quiz.questions.filter(q => q._id !== questionId);
    quiz.points = calculateTotalPoints(quiz);
    await quiz.save();
    return quiz;
  }

  // ========== QUESTION GROUP FUNCTIONS ==========

  // Add a question group to a quiz
  async function addQuestionGroup(quizId, group) {
    const groupWithId = {
      ...group,
      _id: uuidv4(),
      questions: group.questions || []
    };
    const quiz = await model.findOne({ _id: quizId });
    if (!quiz) return null;

    if (!quiz.questionGroups) {
      quiz.questionGroups = [];
    }
    quiz.questionGroups.push(groupWithId);
    quiz.points = calculateTotalPoints(quiz);
    await quiz.save();
    return quiz;
  }

  // Update a question group
  async function updateQuestionGroup(quizId, groupId, groupUpdates) {
    const quiz = await model.findOne({ _id: quizId });
    if (!quiz) return null;

    const groupIndex = quiz.questionGroups.findIndex(g => g._id === groupId);
    if (groupIndex === -1) return null;

    quiz.questionGroups[groupIndex] = {
      ...quiz.questionGroups[groupIndex].toObject(),
      ...groupUpdates,
      _id: groupId
    };
    quiz.points = calculateTotalPoints(quiz);
    await quiz.save();
    return quiz;
  }

  // Delete a question group
  async function deleteQuestionGroup(quizId, groupId) {
    const quiz = await model.findOne({ _id: quizId });
    if (!quiz) return null;

    quiz.questionGroups = quiz.questionGroups.filter(g => g._id !== groupId);
    quiz.points = calculateTotalPoints(quiz);
    await quiz.save();
    return quiz;
  }

  // Add a question to a specific group
  async function addQuestionToGroup(quizId, groupId, question) {
    const quiz = await model.findOne({ _id: quizId });
    if (!quiz) return null;

    const groupIndex = quiz.questionGroups.findIndex(g => g._id === groupId);
    if (groupIndex === -1) return null;

    const questionWithId = { ...question, _id: uuidv4() };
    quiz.questionGroups[groupIndex].questions.push(questionWithId);
    quiz.points = calculateTotalPoints(quiz);
    await quiz.save();
    return quiz;
  }

  // Update a question within a group
  async function updateQuestionInGroup(quizId, groupId, questionId, questionUpdates) {
    const quiz = await model.findOne({ _id: quizId });
    if (!quiz) return null;

    const groupIndex = quiz.questionGroups.findIndex(g => g._id === groupId);
    if (groupIndex === -1) return null;

    const questionIndex = quiz.questionGroups[groupIndex].questions.findIndex(q => q._id === questionId);
    if (questionIndex === -1) return null;

    quiz.questionGroups[groupIndex].questions[questionIndex] = {
      ...quiz.questionGroups[groupIndex].questions[questionIndex].toObject(),
      ...questionUpdates,
      _id: questionId
    };
    await quiz.save();
    return quiz;
  }

  // Delete a question from a group
  async function deleteQuestionFromGroup(quizId, groupId, questionId) {
    const quiz = await model.findOne({ _id: quizId });
    if (!quiz) return null;

    const groupIndex = quiz.questionGroups.findIndex(g => g._id === groupId);
    if (groupIndex === -1) return null;

    quiz.questionGroups[groupIndex].questions = quiz.questionGroups[groupIndex].questions.filter(
      q => q._id !== questionId
    );
    quiz.points = calculateTotalPoints(quiz);
    await quiz.save();
    return quiz;
  }

  // ========== FIND QUESTIONS FUNCTION ==========

  // Search questions across all quizzes in a course
  async function findQuestionsInCourse(courseId, searchTerm = "") {
    const quizzes = await model.find({ course: courseId });
    const results = [];

    const searchLower = searchTerm.toLowerCase();

    for (const quiz of quizzes) {
      // Search in regular questions
      for (const question of quiz.questions || []) {
        if (
          !searchTerm ||
          question.title.toLowerCase().includes(searchLower) ||
          question.question.toLowerCase().includes(searchLower)
        ) {
          results.push({
            ...question.toObject ? question.toObject() : question,
            sourceQuizId: quiz._id,
            sourceQuizTitle: quiz.title,
            sourceType: "question"
          });
        }
      }

      // Search in question groups
      for (const group of quiz.questionGroups || []) {
        for (const question of group.questions || []) {
          if (
            !searchTerm ||
            question.title.toLowerCase().includes(searchLower) ||
            question.question.toLowerCase().includes(searchLower)
          ) {
            results.push({
              ...question.toObject ? question.toObject() : question,
              sourceQuizId: quiz._id,
              sourceQuizTitle: quiz.title,
              sourceGroupId: group._id,
              sourceGroupName: group.name,
              sourceType: "group_question"
            });
          }
        }
      }
    }

    return results;
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
    // Question Group functions
    addQuestionGroup,
    updateQuestionGroup,
    deleteQuestionGroup,
    addQuestionToGroup,
    updateQuestionInGroup,
    deleteQuestionFromGroup,
    findQuestionsInCourse,
  };
}