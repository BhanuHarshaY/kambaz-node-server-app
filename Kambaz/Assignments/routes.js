import AssignmentsDao from "../Assignments/dao.js";
export default function AssignmentsRoutes(app) {

  const dao = AssignmentsDao();
  const findAssignmentsForCourse = async (req, res) => {
    const { courseId } = req.params;
    const assignments = await dao.findAssignmentsForCourse(courseId);
    res.json(assignments);
  };

  const createAssignmentForCourse = async (req, res) => {
    const { courseId } = req.params;
    console.log("Creating assignment for course:", courseId);
    console.log("Request body:", req.body);
    const assignment = {
      ...req.body,
      course: courseId,
    };
    const newAssignment = await dao.createAssignment(assignment);
    console.log("Created assignment:", newAssignment);
    res.send(newAssignment);
  };

  const deleteAssignment = async (req, res) => {
    const { assignmentId } = req.params;
    const status = await dao.deleteAssignment(assignmentId);
    res.send(status);
  };

  const updateAssignment = async (req, res) => {
    const { assignmentId } = req.params;
    const assignmentUpdates = req.body;
    console.log("Updating assignment ID:", assignmentId);
    console.log("Updates:", assignmentUpdates);
    const status = await dao.updateAssignment(assignmentId, assignmentUpdates);
    console.log("Update status:", status);
    res.send(status);
  };

  app.get("/api/courses/:courseId/assignments", findAssignmentsForCourse);
  app.post("/api/courses/:courseId/assignments", createAssignmentForCourse);
  app.delete("/api/assignments/:assignmentId", deleteAssignment);
  app.put("/api/assignments/:assignmentId", updateAssignment);
}