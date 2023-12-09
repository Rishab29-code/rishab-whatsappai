const { Admin, Company, Template } = require("../config");
const { getAdminData, saveAdminData, checkAdminExistenceById, giveCurrentDateTime } = require("../utils");
const { query,where, getDocs, addDoc, doc, setDoc, getDoc } = require("firebase/firestore");

const creatCompany = async(req,res)=>{
    try {
        const {adminId,leadConversion} = req.body;

        const adminExists = await checkAdminExistenceById(adminId);
        if(!adminExists){
            return res.status(404).send({message:'Admin not found'})
        }  

        const admin = await getAdminData(adminId);

        const companyData = {
            leadConversion,
            name:admin.companyName,
            adminId
        }
        

        const companyRef = await addDoc(Company,companyData);
        companyData.id = companyRef.id;
        await setDoc(companyRef,companyData);


        admin.company = companyData.id;

        const adminRef = doc(Admin, adminId); 
        await setDoc(adminRef, admin);

        res.status(201).send({message:'Company created',companyId:companyData.id});

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message });
    }
}

const getCompany = async(req,res)=>{
    try {
        const {companyId} = req.params;

        const companyRef = doc(Company, companyId);
        const company =  await getDoc(companyRef).then(doc => doc.data());

        if(!company){
            return res.status(404).send({message:'Company not found'})
        }

        res.status(200).send({message:'Company found',data:company});

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message });
    }
}
// update company + add and update botInfo
const updateCompany = async(req,res)=>{
    try {
        const {companyId,adminId,botInfo,leadConversion} = req.body;
        console.log("adminExists")
        const adminExists = await checkAdminExistenceById(adminId);
        console.log("adminExists",adminExists)
        if(!adminExists){
            return res.status(404).send({message:'Admin not found'})
        }  

        const companyRef = doc(Company, companyId);
        const company =  await getDoc(companyRef).then(doc => doc.data());

        console.log('company');

        if(company === undefined){
            return res.status(404).send({message:'Company not found'})
        }
        var newlead;
        var modlead;
        if(leadConversion){
        newlead=company.leadConversion||[];
         modlead=[...newlead,leadConversion]
        }

        const {customers,groups,companyDocs} = company;

        const companyData = {
            id:companyId,
            adminId,
            botInfo:botInfo!==undefined?botInfo:company.botInfo||{},
            leadConversion:leadConversion!==undefined?modlead:company.leadConversion,
            customers:customers!==undefined?customers:[],
            groups:groups!==undefined?groups:[],
            companyDocs:companyDocs!==undefined?companyDocs:[]
        }
        console.log(companyData);
 
        await setDoc(companyRef, companyData);

        res.status(201).send({message:'Company updated'});

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message });
    }
}


module.exports = {creatCompany,getCompany,updateCompany}