import { v4 as uuidv4 } from "uuid";
export default function AssignmentsDao(db) {
  function findAssignmentsForCourse(courseId) {
    const { assignments } = db;
    return assignments.filter((assignment) => assignment.course === courseId);
  }
  function createAssignment(assignment) {
    const newAssignment = { ...assignment, _id: uuidv4() };
    db.assignments = [...db.assignments, newAssignment];
    return newAssignment;
  }
  function deleteAssignment(assignmentId) {
    const { assignments } = db;
    db.assignments = assignments.filter(
      (assignment) => assignment._id !== assignmentId
    );
  }
  function updateAssignment(assignmentId, assignmentUpdates) {
    const { assignments } = db;
    const assignment = assignments.find(
      (assignment) => assignment._id === assignmentId
    );
    Object.assign(assignment, assignmentUpdates);
    return assignment;
  }

  return {
    findAssignmentsForCourse,
    createAssignment,
    deleteAssignment,
    updateAssignment,
  };
}