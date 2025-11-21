import EnrollmentsDao from "./dao.js";

export default function EnrollmentsRoutes(app, db) {
  const dao = EnrollmentsDao(db);
  const enrollUserInCourse = (req, res) => {
    const { userId, courseId } = req.params;
    const enrollment = dao.enrollUserInCourse(userId, courseId);
    res.json(enrollment);
  };
  const unenrollUserFromCourse = (req, res) => {
    const { enrollmentId } = req.params;
    dao.unenrollUserFromCourse(enrollmentId);
    res.sendStatus(200);
  };
  const findEnrollmentsForUser = (req, res) => {
    const { userId } = req.params;
    const enrollments = dao.findEnrollmentsForUser(userId);
    res.json(enrollments);
  };
  app.get("/api/enrollments/users/:userId", findEnrollmentsForUser);
  app.delete("/api/enrollments/:enrollmentId", unenrollUserFromCourse);
  app.post(
    "/api/enrollments/users/:userId/courses/:courseId",
    enrollUserInCourse
  );
}