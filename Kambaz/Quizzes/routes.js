import QuizzesDao from "./dao.js";

export default function QuizRoutes(app) {
  const dao = QuizzesDao();

  // Get all quizzes for a course
  const findQuizzesForCourse = async (req, res) => {
    const { courseId } = req.params;
    const currentUser = req.session["currentUser"];

    let quizzes = await dao.findQuizzesForCourse(courseId);

    // If student, only show published quizzes
    if (currentUser && currentUser.role === "STUDENT") {
      quizzes = quizzes.filter(q => q.published);
    }

    res.json(quizzes);
  };

  // Get a single quiz by ID
  const findQuizById = async (req, res) => {
    const { quizId } = req.params;
    const quiz = await dao.findQuizById(quizId);

    if (!quiz) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }

    res.json(quiz);
  };

  // Create a new quiz
  const createQuiz = async (req, res) => {
    const { courseId } = req.params;
    const currentUser = req.session["currentUser"];

    //  Allow FACULTY or TA
    if (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "TA")) {
      res.status(403).json({ error: "Only faculty or TAs can create quizzes" });
      return;
    }

    const quiz = {
      ...req.body,
      course: courseId,
    };

    const newQuiz = await dao.createQuiz(quiz);
    res.json(newQuiz);
  };

  // Update a quiz
  const updateQuiz = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];

    //  Allow FACULTY or TA
    if (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "TA")) {
      res.status(403).json({ error: "Only faculty or TAs can update quizzes" });
      return;
    }

    const result = await dao.updateQuiz(quizId, req.body);
    res.json(result);
  };

  // Delete a quiz
  const deleteQuiz = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];

    //  Allow FACULTY or TA
    if (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "TA")) {
      res.status(403).json({ error: "Only faculty or TAs can delete quizzes" });
      return;
    }

    const result = await dao.deleteQuiz(quizId);
    res.json(result);
  };

  // Publish/unpublish a quiz
  const publishQuiz = async (req, res) => {
    const { quizId } = req.params;
    const { published } = req.body;
    const currentUser = req.session["currentUser"];

    //  Allow FACULTY or TA
    if (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "TA")) {
      res.status(403).json({ error: "Only faculty or TAs can publish quizzes" });
      return;
    }

    const result = await dao.publishQuiz(quizId, published);
    res.json(result);
  };

  // Add a question to a quiz
  const addQuestion = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];

    //  Allow FACULTY or TA
    if (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "TA")) {
      res.status(403).json({ error: "Only faculty or TAs can add questions" });
      return;
    }

    const quiz = await dao.addQuestion(quizId, req.body);
    if (!quiz) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }
    res.json(quiz);
  };

  // Update a question
  const updateQuestion = async (req, res) => {
    const { quizId, questionId } = req.params;
    const currentUser = req.session["currentUser"];

    //  Allow FACULTY or TA
    if (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "TA")) {
      res.status(403).json({ error: "Only faculty or TAs can update questions" });
      return;
    }

    const quiz = await dao.updateQuestion(quizId, questionId, req.body);
    if (!quiz) {
      res.status(404).json({ error: "Quiz or question not found" });
      return;
    }
    res.json(quiz);
  };

  // Delete a question
  const deleteQuestion = async (req, res) => {
    const { quizId, questionId } = req.params;
    const currentUser = req.session["currentUser"];

    //  Allow FACULTY or TA
    if (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "TA")) {
      res.status(403).json({ error: "Only faculty or TAs can delete questions" });
      return;
    }

    const quiz = await dao.deleteQuestion(quizId, questionId);
    if (!quiz) {
      res.status(404).json({ error: "Quiz or question not found" });
      return;
    }
    res.json(quiz);
  };

  // ========== QUESTION GROUP ROUTES ==========

  // Add a question group
  const addQuestionGroup = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];

    if (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "TA")) {
      res.status(403).json({ error: "Only faculty or TAs can add question groups" });
      return;
    }

    const quiz = await dao.addQuestionGroup(quizId, req.body);
    if (!quiz) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }
    res.json(quiz);
  };

  // Update a question group
  const updateQuestionGroup = async (req, res) => {
    const { quizId, groupId } = req.params;
    const currentUser = req.session["currentUser"];

    if (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "TA")) {
      res.status(403).json({ error: "Only faculty or TAs can update question groups" });
      return;
    }

    const quiz = await dao.updateQuestionGroup(quizId, groupId, req.body);
    if (!quiz) {
      res.status(404).json({ error: "Quiz or group not found" });
      return;
    }
    res.json(quiz);
  };

  // Delete a question group
  const deleteQuestionGroup = async (req, res) => {
    const { quizId, groupId } = req.params;
    const currentUser = req.session["currentUser"];

    if (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "TA")) {
      res.status(403).json({ error: "Only faculty or TAs can delete question groups" });
      return;
    }

    const quiz = await dao.deleteQuestionGroup(quizId, groupId);
    if (!quiz) {
      res.status(404).json({ error: "Quiz or group not found" });
      return;
    }
    res.json(quiz);
  };

  // Add a question to a group
  const addQuestionToGroup = async (req, res) => {
    const { quizId, groupId } = req.params;
    const currentUser = req.session["currentUser"];

    if (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "TA")) {
      res.status(403).json({ error: "Only faculty or TAs can add questions to groups" });
      return;
    }

    const quiz = await dao.addQuestionToGroup(quizId, groupId, req.body);
    if (!quiz) {
      res.status(404).json({ error: "Quiz or group not found" });
      return;
    }
    res.json(quiz);
  };

  // Update a question in a group
  const updateQuestionInGroup = async (req, res) => {
    const { quizId, groupId, questionId } = req.params;
    const currentUser = req.session["currentUser"];

    if (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "TA")) {
      res.status(403).json({ error: "Only faculty or TAs can update questions" });
      return;
    }

    const quiz = await dao.updateQuestionInGroup(quizId, groupId, questionId, req.body);
    if (!quiz) {
      res.status(404).json({ error: "Quiz, group, or question not found" });
      return;
    }
    res.json(quiz);
  };

  // Delete a question from a group
  const deleteQuestionFromGroup = async (req, res) => {
    const { quizId, groupId, questionId } = req.params;
    const currentUser = req.session["currentUser"];

    if (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "TA")) {
      res.status(403).json({ error: "Only faculty or TAs can delete questions" });
      return;
    }

    const quiz = await dao.deleteQuestionFromGroup(quizId, groupId, questionId);
    if (!quiz) {
      res.status(404).json({ error: "Quiz, group, or question not found" });
      return;
    }
    res.json(quiz);
  };

  // ========== FIND QUESTIONS ROUTE ==========

  // Search questions in a course
  const findQuestionsInCourse = async (req, res) => {
    const { courseId } = req.params;
    const { q } = req.query;
    const currentUser = req.session["currentUser"];

    if (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "TA")) {
      res.status(403).json({ error: "Only faculty or TAs can search questions" });
      return;
    }

    const questions = await dao.findQuestionsInCourse(courseId, q || "");
    res.json(questions);
  };

  // ========== REGISTER ROUTES ==========

  // Quiz CRUD
  app.get("/api/courses/:courseId/quizzes", findQuizzesForCourse);
  app.post("/api/courses/:courseId/quizzes", createQuiz);
  app.get("/api/quizzes/:quizId", findQuizById);
  app.put("/api/quizzes/:quizId", updateQuiz);
  app.delete("/api/quizzes/:quizId", deleteQuiz);
  app.put("/api/quizzes/:quizId/publish", publishQuiz);

  // Question routes
  app.post("/api/quizzes/:quizId/questions", addQuestion);
  app.put("/api/quizzes/:quizId/questions/:questionId", updateQuestion);
  app.delete("/api/quizzes/:quizId/questions/:questionId", deleteQuestion);

  // Question Group routes
  app.post("/api/quizzes/:quizId/groups", addQuestionGroup);
  app.put("/api/quizzes/:quizId/groups/:groupId", updateQuestionGroup);
  app.delete("/api/quizzes/:quizId/groups/:groupId", deleteQuestionGroup);
  app.post("/api/quizzes/:quizId/groups/:groupId/questions", addQuestionToGroup);
  app.put("/api/quizzes/:quizId/groups/:groupId/questions/:questionId", updateQuestionInGroup);
  app.delete("/api/quizzes/:quizId/groups/:groupId/questions/:questionId", deleteQuestionFromGroup);

  // Find Questions route
  app.get("/api/courses/:courseId/questions/search", findQuestionsInCourse);
}