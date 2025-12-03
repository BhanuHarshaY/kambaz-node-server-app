import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Hello from "./Hello.js";
import Lab5 from "./Lab5/index.js";
import db from "./Kambaz/Database/index.js";
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import EnrollmentRoutes from "./Kambaz/Enrollments/routes.js";
import ModulesRoutes from "./Kambaz/Modules/routes.js";
import AssignmentsRoutes from "./Kambaz/Assignments/routes.js";


import "dotenv/config";
import session from "express-session";

const CONNECTION_STRING = process.env.DATABASE_CONNECTION_STRING || "mongodb://127.0.0.1:27017/kambaz"
mongoose.connect(CONNECTION_STRING);

const app = express();


const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    
    if (!origin) return callback(null, true);
    
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    
    if (origin.includes('kambaz-next') && origin.includes('bhanuharshays-projects.vercel.app')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));


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

// Configure JSON parsing THIRD
app.use(express.json());

// Register routes LAST 
UserRoutes(app, db);
CourseRoutes(app, db);
EnrollmentRoutes(app, db);
ModulesRoutes(app, db);
AssignmentsRoutes(app, db);
Hello(app);
Lab5(app);

app.listen(process.env.PORT || 4000, () => {
  console.log("Server running on http://localhost:4000");
});