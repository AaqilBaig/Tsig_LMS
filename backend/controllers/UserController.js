import User from '../models/UserModel.js';
import bcrypt from 'bcrypt';

const UserController = {
  // Create a new user
  create: async (req, res) => {
    try {
      const user = new User(req.body);
      const savedUser = await user.save();
      res.status(201).json(savedUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  createMany: async (req, res) => {
    try {
      const users = req.body; // Expecting an array of user objects
      console.log('Received users:', users); // Log incoming users

      // Validate user input
      for (const user of users) {
        if (!user.password) {
          return res.status(400).json({ message: 'All fields (fullname, email, password) are required for each user' });
        }
      }

      const salt = await bcrypt.genSalt(10);

      // Hash passwords and prepare users for insertion
      const hashedUsers = await Promise.all(users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return {
          ...user,
          password: hashedPassword // Set the hashed password
        };
      }));

      // Insert all users with hashed passwords into the database
      const newUsers = await User.insertMany(hashedUsers);
      res.status(201).json(newUsers);
    } catch (error) {
      console.error('Error creating users:', error); // Log the error
      res.status(400).json({ message: error.message });
    }
  },

  // Get all users
  getAll: async (req, res) => {
    try {
      const users = await User.find()
        .populate('taskDone')
        .populate('taskAssign');
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get user by ID
  getById: async (req, res) => {
    try {
      const user = await User.findOne({ id: req.params.id })
        .populate('taskDone')
        .populate('taskAssign');
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get users by mentor
  getByMentor: async (req, res) => {
    try {
      const users = await User.find({ mentor: req.params.mentorId })
        .populate('taskDone')
        .populate('taskAssign');
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update user
  update: async (req, res) => {
    try {
      const user = await User.findOneAndUpdate(
        { id: req.params.id },
        req.body,
        { new: true }
      ).populate('taskDone').populate('taskAssign');
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete user
  delete: async (req, res) => {
    try {
      const user = await User.findOneAndDelete({ id: req.params.id });
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get one user by fullname
  getOneUser: async (req, res) => {
    try {
      const { fullname,password } = req.body;

      if (!fullname || !password) {
        return res.status(400).json({ 
          success: false,
          message: 'Fullname and password is required' 
        });
      }

      const cmpUser = await User.findOne({ fullname })
        .populate('taskDone')
        .populate('taskAssign');

      if (!cmpUser) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }
      
      const match = await bcrypt.compare(password, cmpUser.password);

      if (!match) {
        return res.status(400).json({ 
          success: false,
          message: 'Fullname or password is incorrect' 
        });
      }

      res.json({
        success: true,
        user: {
          _id: cmpUser._id,
          id: cmpUser.id,
          fullname: cmpUser.fullname,
          domain: cmpUser.domain,
          taskDone: cmpUser.taskDone,
          taskAssign: cmpUser.taskAssign
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },
};

export default UserController; 