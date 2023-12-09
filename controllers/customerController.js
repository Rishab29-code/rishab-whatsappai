const { Company,Customer } = require("../config");
const { query,setDoc, doc, getDoc, where, getDocs, addDoc,deleteDoc, getDocsFromServer } = require("firebase/firestore");

const createCustomer = async(req,res)=>{
    try {
        const {name,email,phone,companyId} = req.body;

        const companyRef = doc(Company, companyId);
        const company =  await getDoc(companyRef).then(doc => doc.data());

        if(company===undefined){
            res.status(404).send({message:'Company not found'})
        }

        const customerData = {
            name,
            email,
            phone,
            companyId
        }

        await setDoc(doc(Customer,customerData.phone), customerData);

        if(!company.customers){
            company.customers = [];
        }

        company.customers.push(customerData.phone);
        await setDoc(doc(Company, companyId), company);

        res.status(201).send({message:'Customer created'});

    } catch (error) {
        console.log(error);
        res.status(500).send({message: 'Internal server error'})
    }
}
const updateCustomer = async (req, res) => {
    try {
        const { name, email,oldPhone, phone, companyId } = req.body;

        if(oldPhone===phone){
            const customerRef = doc(Customer, phone);
            const customer = await getDoc(customerRef).then(doc => doc.data());

            if (!customer) {
                return res.status(404).send({ message: 'Customer not found' });
            }

            customer.name = name;
            customer.email = email;

            await setDoc(doc(Customer, phone), customer);

            return res.status(200).send({ message: 'Customer updated', data: customer });
        }

        const customerRef = doc(Customer, oldPhone);
        const customer = await getDoc(customerRef).then(doc => doc.data());

        if (customer===undefined) {
            return res.status(404).send({ message: 'Customer not found' });
        }

        const companyRef = doc(Company, companyId);
        const company = await getDoc(companyRef).then(doc => doc.data());

        if (company === undefined) {
            return res.status(404).send({ message: 'Company not found' });
        }

        if (company.customers === undefined) {
            company.customers = [];
        }

        company.customers = company.customers.filter((p) => p !== oldPhone);

        await setDoc(doc(Company, companyId), company);

        const customerData = {
            name,
            email,
            phone,
            companyId
        }

        await setDoc(doc(Customer, customerData.phone), customerData);

        company.customers.push(customerData.phone);
        await setDoc(doc(Company, companyId), company);

        res.status(200).send({ message: 'Customer updated', data: customerData });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

const getCustomer = async(req,res)=>{
    try {
        const {phone} = req.params;

        if(!phone){
            res.status(400).send({message:'Customer phone not provided'})
        }

        const customerRef = doc(Customer, phone);
        const customer = await getDoc(customerRef).then(doc => doc.data());

        console.log(customer)

        if(!customer){
            return res.status(404).send({message:'Customer not found'})
        }

        res.status(200).send({message:'Customer found',data:customer});

    } catch (error) {
        console.log(error);
        res.status(500).send({message: 'Internal server error'})
    }
}

const getCustomers = async(req,res)=>{
    try {
        const {id} = req.params;

        if(!id){
            return res.status(400).send({message:'Company id not provided'})
        }

        const companyRef = doc(Company, id);
        const company =  await getDoc(companyRef).then(doc => doc.data());

        if(company===undefined){
            return res.status(404).send({message:'Company not found'})
        }

        if(company.customers===undefined){
            console.log('get',company)
            return res.status(200).send({customers: []});
        }

        

        const customersData = await Promise.all(
          company.customers.map(async (customer)=>{
          const customerRef = doc(Customer, customer); 
          const customerData = await getDoc(customerRef);
           if(customerData.data()!==null)return customerData.data();
          })
        )

        res.status(200).send({customers: customersData});

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message });
    }
}

const deleteCustomer = async(req,res)=>{
    try {
        const {phone,companyId} = req.body;

        const customerRef = doc(Customer, phone); 
        const customer = await getDoc(customerRef);

        if(!customer){
            return res.status(404).send({message:'Customer not found'})
        }

        const companyRef = doc(Company, companyId);
        const company =  await getDoc(companyRef).then(doc => doc.data());

        if(company===undefined){
            res.status(404).send({message:'Company not found'})
        }

        await deleteDoc(customerRef);

        company.customers = company.customers.filter((p)=> p!== phone);
        await setDoc(doc(Company, companyId), company);

        res.status(200).send({message:'Customer deleted'});

    } catch (error) {
        console.log(error);
        res.status(500).send({message: 'Internal server error'})
    }
}


module.exports = {createCustomer,updateCustomer,getCustomer,deleteCustomer,getCustomers}