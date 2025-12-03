import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export default function AssignmentsDao() {

  async function findAssignmentsForCourse(courseId) {
    return model.find({ course: courseId });
  }

  async function createAssignment(assignment) {
    const newAssignment = { ...assignment, _id: uuidv4() };
    console.log("DAO creating:", newAssignment);
    const created = await model.create(newAssignment);
    console.log("DAO created result:", created);
    return created;
  }

  async function deleteAssignment(assignmentId) {
    return model.deleteOne({ _id: assignmentId });
  }

  async function updateAssignment(assignmentId, assignmentUpdates) {
    console.log("DAO updating ID:", assignmentId);
    console.log("DAO updates:", assignmentUpdates);
    const result = await model.updateOne({ _id: assignmentId }, { $set: assignmentUpdates });
    console.log("DAO update result:", result);
    return result;
  }

  return {
    findAssignmentsForCourse,
    createAssignment,
    deleteAssignment,
    updateAssignment,
  };
}