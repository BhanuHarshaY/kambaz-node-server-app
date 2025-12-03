import UsersDao from "./dao.js";

export default function UserRoutes(app) {
  const dao = UsersDao();
  
  const createUser = async (req, res) => {
    console.log("=== SERVER: POST /api/users - createUser called");
    console.log("Request body:", req.body);
    try {
      const user = await dao.createUser(req.body);
      console.log("DAO created user:", user);
      res.json(user);
    } catch (error) {
      console.error("Error in createUser route:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({ error: "Failed to create user", message: error.message });
    }
  };

  const deleteUser = async (req, res) => {
    console.log("=== DELETE USER called");
    console.log("User ID to delete:", req.params.userId);
    try {
      const status = await dao.deleteUser(req.params.userId);
      console.log("Delete status:", status);
      res.json(status);
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  };
  
  const findAllUsers = async (req, res) => {
    const { role, name } = req.query;
    console.log("=== findAllUsers - Query params:", { role, name });
    
    if (role) {
      console.log("Filtering by role:", role);
      const users = await dao.findUsersByRole(role);
      console.log("Found users by role:", users.length);
      res.json(users);
      return;
    }
    if (name) {
      console.log("Filtering by name:", name);
      const users = await dao.findUsersByPartialName(name);
      console.log("Found users by name:", users.length);
      res.json(users);
      return;
    }

    console.log("Fetching all users");
    const users = await dao.findAllUsers();
    console.log("Found all users:", users.length);
    res.json(users);
  };

  const findUserById = async (req, res) => { 
    const user = await dao.findUserById(req.params.userId);
    res.json(user);
  };

  const updateUser = async (req, res) => {
    const userId = req.params.userId;
    const userUpdates = req.body;
    await dao.updateUser(userId, userUpdates);
    const currentUser = req.session["currentUser"];
    if (currentUser && currentUser._id === userId) {
      req.session["currentUser"] = { ...currentUser, ...userUpdates };
    }
    res.json(currentUser);
  };

  const signup = async (req, res) => {
    const user = await dao.findUserByUsername(req.body.username);
    if (user) {
      res.status(400).json({ message: "Username already taken" });
      return;
    }
    const currentUser = await dao.createUser(req.body);
    req.session["currentUser"] = currentUser;
    res.json(currentUser);
  };

  const signin = async (req, res) => {
    const { username, password } = req.body;
    const currentUser = await dao.findUserByCredentials(username, password);
    if (currentUser) {
      req.session["currentUser"] = currentUser;
      res.json(currentUser);
    } else {
      res.status(401).json({ message: "Unable to login. Try again later." });
    }
  };

  const signout = (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
  };

  const profile = (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    res.json(currentUser);
  };


  app.post("/api/users/signup", signup);
  app.post("/api/users/signin", signin);
  app.post("/api/users/signout", signout);
  app.post("/api/users/profile", profile);
  
  app.post("/api/users", createUser);
  app.get("/api/users", findAllUsers);
  app.get("/api/users/:userId", findUserById);
  app.put("/api/users/:userId", updateUser);
  app.delete("/api/users/:userId", deleteUser);
}