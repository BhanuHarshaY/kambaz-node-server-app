import express from "express";
import cors from "cors";
import Lab5 from "./Lab5/index.js";
import db from "./Kambaz/Database/index.js";
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import EnrollmentRoutes from "./Kambaz/Enrollments/routes.js";
import ModulesRoutes from "./Kambaz/Modules/routes.js";
import AssignmentsRoutes from "./Kambaz/Assignments/routes.js";

import "dotenv/config";
import session from "express-session";

const app = express();

//  Configure CORS FIRST
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL || "http://localhost:3000",
}));

// Configure session SECOND
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz",
  resave: false,
  saveUninitialized: false,
};
if (process.env.SERVER_ENV !== "development") {
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
    domain: process.env.SERVER_URL,
  };
}
app.use(session(sessionOptions));

//  Configure JSON parsing THIRD
app.use(express.json());

//  Register routes LAST 
UserRoutes(app, db);
CourseRoutes(app, db);
EnrollmentRoutes(app, db);
ModulesRoutes(app, db);
AssignmentsRoutes(app, db);
Lab5(app);


app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});