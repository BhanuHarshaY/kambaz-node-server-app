import { v4 as uuidv4 } from "uuid";
import model from "./model.js";

export default function UsersDao() {
  const createUser = async (user) => {
    // Remove _id if it exists in the incoming user object
    delete user._id;
    const newUser = { ...user, _id: uuidv4() };
    return await model.create(newUser);
  };

  const findAllUsers = () => model.find();
  const findUserById = (userId) => model.findById(userId);
  const findUsersByRole = (role) => model.find({ role: role });
  const findUserByUsername = (username) => model.findOne({ username: username });
  
  const findUsersByPartialName = (partialName) => {
    const regex = new RegExp(partialName, "i");
    return model.find({
      $or: [{ firstName: { $regex: regex } }, { lastName: { $regex: regex } }],
    });
  };

  const findUserByCredentials = (username, password) => 
    model.findOne({ username, password });
  
  const updateUser = (userId, user) => 
    model.updateOne({ _id: userId }, { $set: user });
  
  const deleteUser = (userId) => model.findByIdAndDelete(userId);

  return {
    createUser,
    findAllUsers,
    findUserById,
    findUsersByRole,
    findUserByUsername,
    findUsersByPartialName,
    findUserByCredentials,
    updateUser,
    deleteUser,
  };
}