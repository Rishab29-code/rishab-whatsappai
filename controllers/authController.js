const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { checkAdminExistenceEmail, getUserByEmail } = require("../utils");
const { addDoc, setDoc } = require("firebase/firestore");
const { Admin } = require("../config");

const signup = async (req, res) => {
    try {
      const { email, password, name, phoneNumber, whatsappNumber, webhookSecret,companyName } = req.body;
  
      // Check if admin with the given email already exists
      const adminExists = await checkAdminExistenceEmail(email);
      if (adminExists) {
        return res.status(400).send({ message: 'Admin already exists' });
      }
  
      // Hash the password and add a new admin
      const hashedPassword = await bcrypt.hash(password, 10);
      const adminData = {
        email,
        password: hashedPassword,
        name,
        phoneNumber,
        whatsappNumber,
        companyName,
        webhookSecret
      };
      const adminRef = await addDoc(Admin,adminData);
  
      // Update the admin document with its own ID
      adminData.id = adminRef.id;
      await setDoc(adminRef, adminData);
  
      res.status(201).send({ message: 'Admin created' });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  }

const signin = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if the user (admin or agent) with the given email exists
      const user = await getUserByEmail(email);
      if (!user) {
        return res.status(400).send({ message: 'User does not exist' });
      }
  
      // Compare the provided password with the hashed password in the database
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).send({ message: 'Incorrect password' });
      }
  
      // Generate and send a JSON Web Token (JWT) for authentication
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1w' });
      res.status(200).send({ message: 'User signed in', token, data: { ...user, password: undefined } });
  
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  }

module.exports={signup,signin}