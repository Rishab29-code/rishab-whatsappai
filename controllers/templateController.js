const { doc, setDoc, addDoc, getDoc,query,where
,getDocs, 
deleteDoc} = require("firebase/firestore");
const { Template, Admin } = require("../config");
const { getAdminData, checkAdminExistenceById } = require("../utils");
const {OpenAI} = require("openai")

const createTemplate = async (req,res)=>{
    try {
        const {name,description,content,adminId} = req.body;

        console.log(req.body)

        const adminExists = await checkAdminExistenceById(adminId);
        if(!adminExists){
            return res.status(404).send({message:'Admin not found'})
        }

        const template = {
            name,
            description,
            content,
            adminId
        }

        const templateRef = await addDoc(Template,template);
        template.id = templateRef.id;
        await setDoc(templateRef,template);

        const admin = await getAdminData(adminId);

        if(!admin.templates){
            admin.templates = [];
        }
    
        admin.templates.push(template.id);
    
        const adminRef = doc(Admin, adminId); 
        await setDoc(adminRef, admin);

        res.status(200).send({message:"Template created successfully", template})
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal server error')
    }
}

const getTemplate = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).send({ message: 'Template id not provided' });
    }

    try {
        const q = query(Template, where("id", "==", id));
        const querySnapshot = await getDocs(q);
        const template = querySnapshot.docs.map(doc => doc.data())[0];

        res.status(200).send({ template });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message });
    }
}

const getTemplates = async (req, res) => {
    const {id} = req.params;

    if(!id){
        return res.status(400).send({message:'Admin id not provided'})
    }

    try {
        
        const q = query(Admin, where("id", "==", id));
        const querySnapshot = await getDocs(q);
        const admin = querySnapshot.docs.map(doc => doc.data())[0];

        if(admin === undefined) {
            return res.status(404).send({message:'Admin not found'})
        }

        const templatesData = await Promise.all(
            admin.templates.map(async (template)=>{
            const templateRef = doc(Template, template); 
            const templateData = await getDoc(templateRef);
            return templateData.data();
            })
        )

        res.status(200).json({templates: templatesData});

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message });
    }

}


const updateTemplate = async (req, res) => {
    const { id } = req.params;
    const { name, description, content, adminId } = req.body;

    if (!id || !adminId) {
        return res.status(400).send({ message: 'Template id or Admin id not provided' });
    }

    try {
        const q = query(Template, where("id", "==", id));
        const querySnapshot = await getDocs(q);
        const template = querySnapshot.docs.map(doc => doc.data())[0];

        if (template.adminId !== adminId) {
            return res.status(403).send({ message: 'Admin not authorized to update this template' });
        }

        const updatedTemplate = { name, description, content, adminId };
        await setDoc(doc(Template, id), updatedTemplate);

        res.status(200).send({ message: 'Template updated successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message });
    }
}

const deleteTemplate = async (req, res) => {
    const { id } = req.params;
    const { adminId } = req.body;

    if (!id || !adminId) {
        return res.status(400).send({ message: 'Template id or Admin id not provided' });
    }

    try {

        await deleteDoc(doc(Template, id));

        res.status(200).send({ message: 'Template deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message });
    }
}

let buffer = []

const createChatbotTemplate = async (req,res)=>{
    try {

        const {message,action,adminId} = req.body;

        if(!adminId){
            return res.status(400).send({message:'Admin id is required'})
        }

        const adminExists = await checkAdminExistenceById(adminId);
        if(!adminExists){
            return res.status(404).send({message:'Admin not found'})
        }

        if(action === 'clear'){
            buffer = []
            res.status(200).send({message:'Buffer cleared'})
        }

        const openai = new OpenAI({
            apiKey: process.env.OPEN_AI_API_KEY
        });
    

        

        const context = [
            { role: "system", content: "Chat bot which returns message templates for whatsapp chat messages based on the query.respond in json format, just include Template name,description and content nothing else." },
            ...buffer,
            {role:"user",content:message}
        ];
    
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                ...context
            ],
        });

        buffer.push({role:"user",content:message})
        buffer.push({role:"assistant",content:response.choices[0].message.content})

        const template = JSON.parse(response.choices[0].message.content)
        
        const templateData = {
            name:template.template_name,
            description:template.description,
            content:template.content,
            adminId
        }
        
        res.status(200).json({ ...templateData});
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
}

module.exports = {createTemplate, createChatbotTemplate, deleteTemplate, updateTemplate,getTemplate,getTemplates}