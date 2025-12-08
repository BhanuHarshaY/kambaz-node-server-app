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
    
    // Only faculty can create quizzes
    if (!currentUser || currentUser.role !== "FACULTY") {
      res.status(403).json({ error: "Only faculty can create quizzes" });
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
    
    if (!currentUser || currentUser.role !== "FACULTY") {
      res.status(403).json({ error: "Only faculty can update quizzes" });
      return;
    }
    
    const result = await dao.updateQuiz(quizId, req.body);
    res.json(result);
  };

  // Delete a quiz
  const deleteQuiz = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];
    
    if (!currentUser || currentUser.role !== "FACULTY") {
      res.status(403).json({ error: "Only faculty can delete quizzes" });
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
    
    if (!currentUser || currentUser.role !== "FACULTY") {
      res.status(403).json({ error: "Only faculty can publish quizzes" });
      return;
    }
    
    const result = await dao.publishQuiz(quizId, published);
    res.json(result);
  };

  // Add a question to a quiz
  const addQuestion = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];
    
    if (!currentUser || currentUser.role !== "FACULTY") {
      res.status(403).json({ error: "Only faculty can add questions" });
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
    
    if (!currentUser || currentUser.role !== "FACULTY") {
      res.status(403).json({ error: "Only faculty can update questions" });
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
    
    if (!currentUser || currentUser.role !== "FACULTY") {
      res.status(403).json({ error: "Only faculty can delete questions" });
      return;
    }
    
    const quiz = await dao.deleteQuestion(quizId, questionId);
    if (!quiz) {
      res.status(404).json({ error: "Quiz or question not found" });
      return;
    }
    res.json(quiz);
  };

  // Routes
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
}