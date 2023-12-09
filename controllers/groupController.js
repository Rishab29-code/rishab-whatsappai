const { doc, getDoc, setDoc, deleteDoc } = require("firebase/firestore");
const { Group, Company } = require("../config");

const getGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const group = await getDoc(doc(Group, id)).then(doc=>doc.data());
        res.status(200).json(group);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'internal server error' });
    }
}

const getGroups = async (req, res) => {
    try {
        const { id } = req.params;
        
        const company = await getDoc(doc(Company, id)).then(doc=>doc.data());
        if(company===undefined){
            return res.status(404).send({message:'Company not found'})
        }

        const groups = await Promise.all(company.groups.map(async groupId=>{
            const group = await getDoc(doc(Group, groupId)).then(doc=>doc.data());
            if(group !== undefined){
                return group;
            }
        }));

        res.status(200).json(groups);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'internal server error' });
    }
}

const updateGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const {groupName,customers} = req.body;

        const groupRef = doc(Group, id);
        const group = await getDoc(groupRef).then(doc=>doc.data());

        if(group===undefined){
            return res.status(404).send({message:'Group not found'})
        }

        group.groupName = groupName;
        group.customers = customers;

        await setDoc(groupRef, group);

        res.status(200).send({message:'Group updated successfully'});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'internal server error' });
    }
}

const deleteGroup = async (req, res) => {
    try {
        const {groupId} = req.params;
        const {companyId} = req.body;

        const groupRef = doc(Group, groupId);
        const group = await getDoc(groupRef).then(doc=>doc.data());

        if(group===undefined){
            return res.status(404).send({message:'Group not found'})
        }

        const companyRef = doc(Company, companyId);
        const company = await getDoc(companyRef).then(doc=>doc.data());


        if(company===undefined){
            return res.status(404).send({message:'Company not found'})
        }
        await deleteDoc(groupRef);

        if(company.groups.length>0)company.groups = company.groups.filter(group=>group!==groupId);

        await setDoc(companyRef, company);

        res.status(200).send({message:'Group deleted successfully'});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'internal server error' });
    }
}

module.exports = { getGroup, getGroups, updateGroup, deleteGroup }