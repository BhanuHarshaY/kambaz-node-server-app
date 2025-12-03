import EnrollmentsDao from "./dao.js";

export default function EnrollmentsRoutes(app) {
  const dao = EnrollmentsDao();
  const enrollUserInCourse = async (req, res) => {
    const { userId, courseId } = req.params;
    const enrollment = await dao.enrollUserInCourse(userId, courseId);
    res.json(enrollment);
  };
  const unenrollUserFromCourse = async (req, res) => {
    const { enrollmentId } = req.params;
    await dao.unenrollUserFromCourse(enrollmentId);
    res.sendStatus(200);
  };

  const findEnrollmentsForUser = async (req, res) => {
    const { userId } = req.params;
    const enrollments = await dao.findEnrollmentsForUser(userId);
    res.json(enrollments);
  };

  app.post(
    "/api/enrollments/users/:userId/courses/:courseId",
    enrollUserInCourse
  );
  app.get("/api/enrollments/users/:userId", findEnrollmentsForUser);
  app.delete("/api/enrollments/:enrollmentId", unenrollUserFromCourse);
}