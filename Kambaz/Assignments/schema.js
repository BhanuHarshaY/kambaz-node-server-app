import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    _id: String,
    title: String,
    course: String,
    availableDate: String,
    dueDate: String,
    availableUntil: String,
    points: Number,
    modules: [String],
    description: String,
    assignmentGroup: String,
    displayGradeAs: String,
    submissionType: String,
    onlineEntryOptions: {
      textEntry: Boolean,
      websiteUrl: Boolean,
      mediaRecordings: Boolean,
      studentAnnotation: Boolean,
      fileUpload: Boolean,
    },
    assignTo: [String],
  },
  { collection: "assignments" }
);

export default schema;