import { v4 as uuidv4 } from "uuid";
import model from "./model.js";


export default function EnrollmentsDao() {
  
  async function enrollUserInCourse(userId, courseId) {
    const enrollmentId = `${userId}-${courseId}`;  
    const existingEnrollment = await model.findById(enrollmentId);
    if (existingEnrollment) {
      return existingEnrollment;
    } 
    return model.create({
      user: userId,
      course: courseId,
      _id: enrollmentId,
    });
  }

  function unenrollAllUsersFromCourse(courseId) {
    return model.deleteMany({ course: courseId });
  }

 
  function unenrollUserFromCourse(user, course) {
    return model.deleteOne({ user, course });
  }

  
   async function findUsersForCourse(courseId) {
    const enrollments = await model.find({ course: courseId }).populate("user");
    return enrollments.map((enrollment) => enrollment.user);
  }

  
  async function findCoursesForUser(userId) {
    const enrollments = await model.find({ user: userId }).populate("course");
    return enrollments.map((enrollment) => enrollment.course);
  }

  
 
 
  async function findEnrollmentsForUser(userId) {
    return model.find({ user: userId });
  }

  return {
    findCoursesForUser,findUsersForCourse,findEnrollmentsForUser,enrollUserInCourse,
    unenrollUserFromCourse,
    unenrollAllUsersFromCourse,
  };
}