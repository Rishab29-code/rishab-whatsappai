const bcrypt = require("bcryptjs");
const { addDoc, setDoc, collectionGroup, doc, getDoc,where, getDocs, query, deleteDoc } = require("firebase/firestore");

const { checkAdminExistenceEmail, getAdminData, saveAdminData } = require("../utils");
const { Admin, Agent } = require("../config");

const addAgent = async (req, res) => {
    try {
      const { name, email,phoneNumber, adminId, password } = req.body;
  
      // Check if agent with the given email already exists
      const agentExists = await checkAdminExistenceEmail(email);
      if (agentExists) {
        return res.status(400).send({ message: 'Agent already exists' });
      }
  
      // Hash the password and add a new agent
      const hashedPassword = await bcrypt.hash(password, 10);
      const agentData = {
        name,
        email,
        adminId,
        phoneNumber,
        password: hashedPassword,
      };
      const agentRef = await addDoc(Agent, agentData);
  
      // Update the agent document with its own ID
      agentData.id = agentRef.id;
      await setDoc(agentRef, agentData);
  
      // Retrieve the admin's data
      const admin = await getAdminData(adminId);


      if(!admin.agents){
        admin.agents = [];
      }
  
      // Add the new agent's ID to the admin's agents array
      admin.agents.push(agentData.id);
  
      const adminRef = doc(Admin, admin.id); 
      await setDoc(adminRef, admin);
  
      res.status(201).send({ message: 'Agent created' });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
}

const updateAgent = async(req,res)=>{
    try {
        const {id} = req.params;
        const {name,email,phoneNumber} = req.body;

        const agentRef = doc(Agent, id); 
        const agent = await getDoc(agentRef);

        if(!agent.exists()){
            return res.status(404).send({message:'Agent not found'})
        }

        const agentData = agent.data();

        //const hashedPassword =  password ? await bcrypt.hash(password, 10) : agentData.password;
        agentData.name = name;
        agentData.email = email;
        agentData.phoneNumber = phoneNumber;

        await setDoc(agentRef,agentData);

        res.status(200).json({message:'Agent updated'});

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

const getAgent = async (req, res) => {
  const { id } = req.params;

  if (!id) {
      return res.status(400).send({ message: 'Agent id not provided' });
  }

  try {
    const q = query(Agent, where("id", "==", id));
    const querySnapshot = await getDocs(q);
    const agent = querySnapshot.docs.map(doc => doc.data())[0];


      res.status(200).send({ ...agent,password:undefined, });
  } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
  }
}

const getAgents = async(req,res)=>{
    try {
        const {id} = req.params;

        if(!id){
            return res.status(400).send({message:'Admin id not provided'})
        }

        const admin = await getAdminData(id);

        if(!admin){
            return res.status(404).send({message:'Admin not found'})
        }

        const agentsData = await Promise.all(
          admin.agents.map(async (agent)=>{
          const agentRef = doc(Agent, agent); 
          const agentData = await getDoc(agentRef);
          return agentData.data();
          })
        )

        res.status(200).send({agents:{...agentsData,password:undefined}});

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message });
    }
}


const deleteAgent = async (req, res) => {

  try {
    const { id } = req.params;

    if (!id) {
        return res.status(400).send({ message: 'Agent id not provided' });
    }
    const q = query(Agent, where("id", "==", id));
    const querySnapshot = await getDocs(q);
    const agent = querySnapshot.docs.map(doc => doc.data())[0];

    if(agent === undefined){
        return res.status(404).send({message:'Agent not found'})
    }

    const adminRef = doc(Admin, agent.adminId);
    const adminData = await getDoc(adminRef);
    const admin = adminData.data();

    await deleteDoc(doc(Agent, id));

    admin.agents = admin.agents.filter((agent)=>agent!==id);
    await setDoc(adminRef,admin);

    res.status(200).send({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
}

module.exports = { addAgent, updateAgent, getAgents, deleteAgent,getAgent };