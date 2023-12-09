
const { getDocs, addDoc, query, where, doc, setDoc, collectionGroup } = require("firebase/firestore");
const { Admin, Agent } = require("./config.js");
const giveCurrentDateTime = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
  }
  
  // Function to save admin data back to the database
  async function saveAdminData(admin) {
    try {
      const adminRef = doc(Admin, admin.id); 
      await setDoc(adminRef, admin);
    } catch (error) {
      console.log(error, "error in saveAdminData");
    }
  }
  
  // Function to check if an admin with the given email exists
  async function checkAdminExistenceEmail(email) {
    try {
      const q = query(Admin, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.length > 0;
    } catch (error) {
      console.error(`Error checking admin existence by email: ${error}`);
      throw error;  
    }
  } 

  async function checkAdminExistenceId(Id) {
    try {
      const q = query(Admin, where("id", "==", Id));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.length > 0;
    } catch (error) {
      console.error(`Error checking admin existence by id: ${error}`);
      throw error;  
    }
  }
  
  // Function to check if an agent with the given email exists
  async function checkAgentExistence(agentEmail) {
    try {
      const q = query(Agent, where("email", "==", agentEmail));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.length > 0;
  } catch (error) {
      console.error(`Error checking agent existence: ${error}`);
      throw error;
  }
  }

  // Function to check if an admin with the given id exists
  async function checkAdminExistenceById(adminId) {
    try {
      const q = query(Admin, where("id", "==", adminId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.length > 0;
  } catch (error) {
      console.error(`Error checking admin existence by id: ${error}`);
      throw error;
  }
  }
  
  // Function to get an admin's data by id
  async function getAdminData(adminId) {
    try {
      const q = query(Admin, where("id", "==", adminId));
      const querySnapshot = await getDocs(q);
      const admin = querySnapshot.docs.map(doc => doc.data())[0];
      if(admin==undefined) throw new Error("Admin not found");
      return admin;
    } catch (error) {
      console.error(`Error getting admin data by id: ${error}`);
      throw error;
    }
  }

  // Function to get a user (admin or agent) by email
  async function getUserByEmail(email) {
    try {
      const adminQuery = query(Admin, where("email", "==", email));
      const agentQuery = query(Agent, where("email", "==", email));
  
      const adminSnapshot = await getDocs(adminQuery);
      const agentSnapshot = await getDocs(agentQuery);
  
      const admin = adminSnapshot.docs.map(doc => doc.data())[0];
      const agent = agentSnapshot.docs.map(doc => doc.data())[0];
  
      if (admin) {
        return admin;
      } else if (agent) {
        return agent;
      }
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  

module.exports={
  getAdminData,
  giveCurrentDateTime,
  saveAdminData,
  checkAdminExistenceEmail,
  checkAdminExistenceById,
  checkAgentExistence,
  getUserByEmail,
  checkAdminExistenceById
}