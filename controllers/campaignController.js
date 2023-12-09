const { doc, setDoc, addDoc, getDoc,deleteDoc } = require("firebase/firestore");
const { Campaign, Admin, Company, Template } = require("../config");
const { getAdminData } = require("../utils");

const createCampaign = async (req,res)=>{
    try {
        const {name,description,template,customers,timings,companyId,groups} = req.body;

        const company = await getDoc(doc(Company, companyId)).then(doc=>doc.data());
        if(company===undefined){
            return res.status(404).send({message:'Company not found'})
        }

        const campaign = {
            name,
            description,
            template,
            customers,
            timings,
            companyId,
            groups
        };

        const campaignRef = await addDoc(Campaign,campaign);
        campaign.id = campaignRef.id;
        await setDoc(campaignRef,campaign);


        if(company.campaigns === undefined){
            company.campaigns = [];
        }
    
        company.campaigns.push(campaign.id);
    
        await setDoc(doc(Company, companyId), company);

        res.status(200).send({message:"Campaign created successfully",id:campaign.id})

    } catch (error) {
        console.log(error)
        res.status(500).send('Internal server error')
    }
}

const getCampaign = async (req,res)=>{
    const {id} = req.params;
    try {
        const campaign = await getDoc(doc(Campaign,id)).then(doc=>doc.data());
        if(campaign===undefined){
            return res.status(404).send({message:'Campaign not found'})
        }

        campaign.tamplate = await getDoc(doc(Template,campaign.template)).then(doc=>doc.data());


        res.status(200).send(campaign);
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal server error')
    }

}

const getCampaigns = async (req,res)=>{
    const {id} = req.params;
    try {
        const company = await getDoc(doc(Company,id)).then(doc=>doc.data());
        if(company===undefined){
            return res.status(404).send({message:'Company not found'})
        }

        const campaigns = await Promise.all(company.campaigns.map(async campaignId=>{
            const campaign = await getDoc(doc(Campaign,campaignId)).then(doc=>doc.data());
            return campaign;
        }))

        res.status(200).send(campaigns);
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal server error')
    }
}

const updateCampaign = async (req,res)=>{
    const {id} = req.params;
    const {name,description,template,customers,timings,groups} = req.body;
    try {
        const campaign = await getDoc(doc(Campaign,id)).then(doc=>doc.data());
        if(campaign===undefined){
            return res.status(404).send({message:'Campaign not found'})
        }

        const updatedCampaign = {
            id:id,
            name,
            description,
            template,
            customers,
            timings,
            companyId:campaign.companyId,
            groups
        }

        await setDoc(doc(Campaign,id),updatedCampaign);

        res.status(200).send({message:'Campaign updated successfully'});
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal server error')
    }
}

const deleteCampaign = async (req,res)=>{
    const {id} = req.params;
    try {
        
        const campaign = await getDoc(doc(Campaign,id)).then(doc=>doc.data());
        console.log("campaign",campaign)
        
        if(campaign===undefined){
            return res.status(404).send({message:'Campaign not found'})
        }
        console.log("campaign id",campaign.companyId)
        const company = await getDoc(doc(Company,campaign.companyId)).then(doc=>doc.data());
        
        
        company.campaigns = company.campaigns.filter(campaign=>{
            console.log(campaign===id,campaign,id)
            return campaign!==id
        });

        await setDoc(doc(Company,campaign.companyId),company);
        await deleteDoc(doc(Campaign,id));

        res.status(200).send({message:'Campaign deleted successfully'});
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal server error')
    }
}

module.exports = {createCampaign,getCampaign,getCampaigns,updateCampaign,deleteCampaign}