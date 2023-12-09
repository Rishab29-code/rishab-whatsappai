const { doc, getDoc, setDoc, query, where, getDocs } = require("firebase/firestore");
const bcrypt = require('bcryptjs');
const { Admin, Company } = require("../config");

const getAdmin = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send({ message: 'Admin id not provided' });
  }

  try {
    const q = query(Admin, where("id", "==", id));
    const querySnapshot = await getDocs(q);
    const admin = querySnapshot.docs.map(doc => doc.data())[0];

    if (admin===undefined) {
      return res.status(404).send({ message: 'Admin not found' });
    }

    const comapanyQ = query(Company, where("id", "==", admin.company));
    const companyQuerySnapshot = await getDocs(comapanyQ);
    const company = companyQuerySnapshot.docs.map(doc => doc.data())[0];

    const adminData = {
      ...admin,
      files: company.companyDocs
    }

    res.status(200).send({ ...adminData });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
}

const updateAdmin = async(req,res)=>{
    try {
      const {id} = req.params;
      const {name, email, password, phoneNumber, whatsappNumber, webhookSecret, companyName} = req.body;
  
      const adminRef = doc(Admin, id); 
      const admin = await getDoc(adminRef);
  
      if(!admin.exists()){
        return res.status(404).send({message:'Admin not found'})
      }
  
      const adminData = admin.data();
  
      const hashedPassword =  password ? await bcrypt.hash(password, 10) : adminData.password;
      console.log("hashed",hashedPassword)
      adminData.name = name;
      adminData.email = email;
      adminData.password = hashedPassword
      adminData.phoneNumber = phoneNumber;
      adminData.whatsappNumber = whatsappNumber;
      adminData.webhookSecret = webhookSecret;
      adminData.companyName = companyName;
  
      await setDoc(adminRef, adminData);
  
      res.status(200).send({message:'Admin updated'});
  
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
}

module.exports = {getAdmin,updateAdmin}