const express = require('express');
const customerController = require('../controllers/customerController.js');

const { collection, addDoc, getDoc } = require('firebase/firestore');
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage");
const multer = require('multer');
const { giveCurrentDateTime, checkAdminExistenceById, getAdminData } = require('../utils.js');
const { query, getDocs, where, doc, setDoc } = require('firebase/firestore');
const { Company, Student, Customer, Group } = require('../config.js');
const Papa = require('papaparse');
const XLSX = require('xlsx');

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage();
// Setting up multer as a middleware to grab photo uploads
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post('/',customerController.createCustomer);
router.get('/:phone',customerController.getCustomer);
router.put('/',customerController.updateCustomer);
router.get('/all/:id',customerController.getCustomers);
router.delete('/',customerController.deleteCustomer);
router.post('/multipleCustomers',upload.single("file"),multipleCustomersUpload);

async function multipleCustomersUpload(req, res) {
    try {
        let { adminId,overwrite,companyId,groupName } = req.body;
        
        if(overwrite==='true')overwrite=true;

        const adminExists = await checkAdminExistenceById(adminId);
        if(!adminExists){
            return res.status(404).send({message:'Admin not found'})
        }

        if(!req.file){
            return res.status(400).json({ message: 'Please upload a file' });
        }

        let parsedData;

        if (req.file.mimetype === 'application/vnd.ms-excel' || req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const csvData = XLSX.utils.sheet_to_csv(worksheet);

            parsedData = await new Promise((resolve) => {
                Papa.parse(csvData, {
                    header: true,
                    skipEmptyLines: true,
                    dynamicTyping: true,
                    complete: (result) => resolve(result.data),
                });
            });
        } else if (req.file.mimetype === 'text/csv') {
            parsedData = await new Promise((resolve) => {
                Papa.parse(req.file.buffer.toString(), {
                    header: true,
                    skipEmptyLines: true,
                    dynamicTyping: true, 
                    complete: (result) => resolve(result.data),
                });
            });
        } else {
            return res.status(400).json({ message: 'Unsupported file type' });
        }

        if (!parsedData || parsedData.length === 0) {
            return res.status(400).json({ message: 'No data found in file' });
        }

        if(!groupName){
            return res.status(400).json({ message: 'GroupName is required' });
        }

        const groupRef = await addDoc(Group,{groupName,companyId});
        const group = await getDoc(groupRef).then(doc=>doc.data());
        group.id = groupRef.id;
        

        parsedData = parsedData.map((record) => ({
            name: record.name || null,
            email: record.email || null,
            phone: record.phone || null,
            companyId: record.companyId || null,
        }));


        const customers = [];
        const existing = []

        const companyRef = doc(Company, companyId);
        const company = await getDoc(companyRef).then(doc=>doc.data())

        

        for (const record of parsedData) {
            if(!record.phone)break;
            const customerData = {
                name: record.name,
                email: record.email,
                phone: record.phone,
                companyId: record.companyId,
            };

            if(overwrite===true){
                console.log('overwrite is true')

                const existingDoc = company.customers!== undefined?company.customers.find(customer=>customer===customerData.phone):undefined;

                if(existingDoc!==undefined){
                    await setDoc(doc(Customer,customerData.phone), customerData);
                    existing.push({
                        old:existingDoc,
                        new:customerData
                    });
                }
                else{
                    await setDoc(doc(Customer,customerData.phone), customerData);
                    customers.push({
                    ...customerData,
                    });
                
                    if(!company.customers){
                        company.customers = [];
                    }
        
                    company.customers.push(customerData.phone);
                }
            }
            else{
                let existingDoc
                if(company.customers!==undefined)
                 existingDoc = company.customers.find(customer=>customer===customerData.phone);
                
                if (existingDoc !== undefined) {
                    existing.push({
                        ...customerData,
                    });
                }
                else{
                    customers.push({
                        ...customerData,
                    });

                    if(!company.customers){
                        company.customers = [];
                    }

                    await setDoc(doc(Customer,customerData.phone), customerData);
            
                    company.customers.push(customerData.phone);
                }

                
            }

            if(group.customers===undefined){
                group.customers = [];
            }
            if(company.groups===undefined){
                company.groups = [];
            }

            if(company.groups !== undefined){
                company.groups = company.groups.filter(group=>group!==undefined);
            }

            group.customers.push(customerData.phone);


            // await setDoc(doc(Customer,customerData.phone), customerData);

            // customers.push({
            //     ...customerData,
            // });

            // if(!company.customers){
            //     company.customers = [];
            // }
    
            // company.customers.push(customerData.phone);
            // await setDoc(doc(Company, company.id), company);

            // res.status(200).send({message:'Customers uploaded',customers,existing});
           
        }

        await setDoc(doc(Group, groupRef.id), group);
        company.groups.push(groupRef.id);
        console.log(company)
        await setDoc(doc(Company, companyId), company);

        res.status(201).json({ customersLength: customers.length, existingLength: existing.length, customers, existing });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal server error');
    }
}


module.exports = router;