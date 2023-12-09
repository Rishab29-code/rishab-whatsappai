const express = require('express');
const companyController = require('../controllers/companyController.js');

const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage");
const multer = require('multer');
const { giveCurrentDateTime, checkAdminExistenceById, getAdminData } = require('../utils.js');
const { query, getDocs, where, doc, setDoc } = require('firebase/firestore');
const { Company } = require('../config.js');

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage();
// Setting up multer as a middleware to grab photo uploads
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post('/create', companyController.creatCompany);
router.get('/:companyId', companyController.getCompany);
router.put('/update', companyController.updateCompany);
router.post('/companyDocs', upload.single("file"), singleFileupload);

async function singleFileupload(req,res){
    try {
        const dateTime = giveCurrentDateTime();
        const {adminId,companyId} = req.body;
  
        // Check if the admin with the given email exists
        const adminExists = await checkAdminExistenceById(adminId);
        if (!adminExists) {
            return res.status(404).send({ message: 'Admin not found' });
        }
  
        // Get the admin data by email
        const admin = await getAdminData(adminId);
  
  
        const storageRef = ref(storage, `files/${`${admin.email!=undefined?admin.email:adminId}`}/${req.file.originalname + "       " + dateTime}`);
  
        // Create file metadata including the content type
        const metadata = {
            contentType: req.file.mimetype,
        };
  
        // Upload the file in the bucket storage
        const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
  
        
        // Grab the public URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        const comapany = admin.company;

        const q = query(Company, where("id", "==", comapany));
        const querySnapshot = await getDocs(q);
        const company = querySnapshot.docs.map(doc => doc.data())[0];
  
        fileDetails = {
          fileName: req.file.originalname,
          filePath: `files/${admin.email!=undefined?admin.email:adminId}/${req.file.originalname + " " + dateTime}`,
          downloadURL
        };
  

        if(!company.companyDocs){
            company.companyDocs = [];
        }

        company.companyDocs.push(fileDetails);

        const companyRef = doc(Company, companyId); 
        await setDoc(companyRef, company);

        console.log('File successfully uploaded.');
        return res.send({
            message: 'file uploaded to firebase storage',
            name: req.file.originalname,
            type: req.file.mimetype,
            downloadURL: downloadURL
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal server error');
    }
}



module.exports = router;