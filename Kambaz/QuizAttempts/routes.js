import QuizAttemptsDao from "./dao.js";
import QuizzesDao from "../Quizzes/dao.js";

export default function QuizAttemptRoutes(app) {
  const attemptsDao = QuizAttemptsDao();
  const quizzesDao = QuizzesDao();

 // Helper function to grade answers
const gradeAnswers = (questions, answers) => {
  let totalScore = 0;
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
  
  // Convert Mongoose documents to plain objects
  const plainAnswers = answers.map(a => {
    if (a.toObject) {
      return a.toObject();
    }
    return { ...a };
  });
  
  const gradedAnswers = plainAnswers.map(answer => {
    const question = questions.find(q => q._id === answer.questionId);
    if (!question) return { ...answer, isCorrect: false, pointsEarned: 0 };
    
    let isCorrect = false;
    
    switch (question.type) {
      case "MULTIPLE_CHOICE":
        const correctChoice = question.choices.find(c => c.isCorrect);
        isCorrect = correctChoice && correctChoice._id === answer.selectedChoiceId;
        break;
        
      case "TRUE_FALSE":
        isCorrect = question.correctAnswer === answer.selectedAnswer;
        break;
        
      case "FILL_IN_BLANK":
        // Check if any of the provided answers match any acceptable answer
        // Case insensitive comparison
        if (answer.textAnswers && answer.textAnswers.length > 0) {
          const userAnswers = answer.textAnswers.map(a => a.toLowerCase().trim());
          const acceptableAnswers = question.blankAnswers.map(a => a.text.toLowerCase().trim());
          
          // For simplicity, check if all blanks have at least one matching answer
          isCorrect = userAnswers.every(ua => 
            acceptableAnswers.some(aa => aa === ua)
          );
        }
        break;
    }
    
    const pointsEarned = isCorrect ? question.points : 0;
    totalScore += pointsEarned;
    
    return {
      questionId: answer.questionId,
      questionType: answer.questionType,
      selectedChoiceId: answer.selectedChoiceId,
      selectedAnswer: answer.selectedAnswer,
      textAnswers: answer.textAnswers || [],
      isCorrect,
      pointsEarned,
    };
  });
  
  return { gradedAnswers, totalScore, totalPoints };
};
  // Get attempt status for current user on a quiz
  const getAttemptStatus = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];
    
    if (!currentUser) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    
    const quiz = await quizzesDao.findQuizById(quizId);
    if (!quiz) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }
    
    const attemptCount = await attemptsDao.getAttemptCount(currentUser._id, quizId);
    const latestAttempt = await attemptsDao.findLatestAttempt(currentUser._id, quizId);
    const inProgressAttempt = await attemptsDao.findInProgressAttempt(currentUser._id, quizId);
    
    const canRetake = quiz.multipleAttempts 
      ? attemptCount < quiz.howManyAttempts 
      : attemptCount < 1;
    
    res.json({
      attemptCount,
      maxAttempts: quiz.multipleAttempts ? quiz.howManyAttempts : 1,
      canRetake,
      latestAttempt,
      inProgressAttempt,
    });
  };

  // Start a new attempt
  const startAttempt = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];
    
    if (!currentUser) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    
    const quiz = await quizzesDao.findQuizById(quizId);
    if (!quiz) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }
    
    // Check if student (faculty can preview without limits)
    if (currentUser.role === "STUDENT") {
      // Check if quiz is published
      if (!quiz.published) {
        res.status(403).json({ error: "Quiz is not published" });
        return;
      }
      
      // Check access code if required
      const { accessCode } = req.body;
      if (quiz.accessCode && quiz.accessCode !== accessCode) {
        res.status(403).json({ error: "Invalid access code" });
        return;
      }
      
      // Check attempt limits
      const attemptCount = await attemptsDao.getAttemptCount(currentUser._id, quizId);
      const maxAttempts = quiz.multipleAttempts ? quiz.howManyAttempts : 1;
      
      if (attemptCount >= maxAttempts) {
        res.status(403).json({ error: "Maximum attempts reached" });
        return;
      }
      
      // Check for in-progress attempt
      const inProgress = await attemptsDao.findInProgressAttempt(currentUser._id, quizId);
      if (inProgress) {
        res.json(inProgress);
        return;
      }
    }
    
    const attempt = await attemptsDao.startAttempt(currentUser._id, quizId, quiz.course);
    res.json(attempt);
  };

  // Save an answer during the quiz
  const saveAnswer = async (req, res) => {
    const { attemptId } = req.params;
    const currentUser = req.session["currentUser"];
    
    if (!currentUser) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    
    const attempt = await attemptsDao.findAttemptById(attemptId);
    if (!attempt) {
      res.status(404).json({ error: "Attempt not found" });
      return;
    }
    
    if (attempt.user !== currentUser._id) {
      res.status(403).json({ error: "Not your attempt" });
      return;
    }
    
    if (attempt.status !== "IN_PROGRESS") {
      res.status(400).json({ error: "Attempt already submitted" });
      return;
    }
    
    const updatedAttempt = await attemptsDao.saveAnswer(attemptId, req.body);
    res.json(updatedAttempt);
  };

  // Submit the quiz
 // Submit the quiz
 const submitAttempt = async (req, res) => {
  const { attemptId } = req.params;
  const { timedOut } = req.body;
  const currentUser = req.session["currentUser"];
  
  if (!currentUser) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  
  const attempt = await attemptsDao.findAttemptById(attemptId);
  if (!attempt) {
    res.status(404).json({ error: "Attempt not found" });
    return;
  }
  
  if (attempt.user !== currentUser._id) {
    res.status(403).json({ error: "Not your attempt" });
    return;
  }
  
  if (attempt.status !== "IN_PROGRESS") {
    res.status(400).json({ error: "Attempt already submitted" });
    return;
  }
  
  // Get the quiz to grade
  const quiz = await quizzesDao.findQuizById(attempt.quiz);
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }
  
  // Grade the answers
  const { gradedAnswers, totalScore, totalPoints } = gradeAnswers(
    quiz.questions, 
    attempt.answers
  );
  
  console.log("Grading results:", { gradedAnswers, totalScore, totalPoints });
  
  const status = timedOut ? "TIMED_OUT" : "SUBMITTED";
  const updatedAttempt = await attemptsDao.submitAttempt(attemptId, gradedAnswers, totalScore, totalPoints, status);
  
  console.log("Updated attempt:", updatedAttempt);
  
  res.json(updatedAttempt);
};

  // Get a specific attempt (for viewing results)
  const getAttempt = async (req, res) => {
    const { attemptId } = req.params;
    const currentUser = req.session["currentUser"];
    
    if (!currentUser) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    
    const attempt = await attemptsDao.findAttemptById(attemptId);
    if (!attempt) {
      res.status(404).json({ error: "Attempt not found" });
      return;
    }
    
    // Students can only view their own attempts
    if (currentUser.role === "STUDENT" && attempt.user !== currentUser._id) {
      res.status(403).json({ error: "Not your attempt" });
      return;
    }
    
    res.json(attempt);
  };

  // Get latest attempt for viewing results
  const getLatestAttempt = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];
    
    if (!currentUser) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    
    const attempt = await attemptsDao.findLatestAttempt(currentUser._id, quizId);
    res.json(attempt);
  };

  // Routes
  app.get("/api/quizzes/:quizId/attempts/status", getAttemptStatus);
  app.post("/api/quizzes/:quizId/attempts/start", startAttempt);
  app.get("/api/quizzes/:quizId/attempts/latest", getLatestAttempt);
  app.put("/api/attempts/:attemptId/answer", saveAnswer);
  app.post("/api/attempts/:attemptId/submit", submitAttempt);
  app.get("/api/attempts/:attemptId", getAttempt);
}