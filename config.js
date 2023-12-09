const { initializeApp } = require('firebase/app');
const { getFirestore, collection } = require('firebase/firestore');

// firebase configuration 
const firebaseConfig = {
  apiKey: "AIzaSyB3rXm2-KUjSRFxa2LINhmg15Q5WMPvhsw",
  authDomain: "mastork-69515.firebaseapp.com",
  projectId: "mastork-69515",
  storageBucket: "mastork-69515.appspot.com",
  messagingSenderId: "850201229778",
  appId: "1:850201229778:web:3347f8547bdd94c2c4700b",
  measurementId: "G-ENHV200CJK"
};

// initialize firebase app 
initializeApp(firebaseConfig)

// initialize firestore
const db = getFirestore()

// initialize collections
const Admin =collection(db,"Admins")
const Agent =collection(db,"Agents")
const Company = collection(db,"Companies")
const Template = collection(db,"Templates")
const Campaign = collection(db,"Campaigns")
const Customer = collection(db,"Customers")
const Group = collection(db,"Groups")


// export collections
module.exports={Admin,Agent,Company,Template,Campaign,Customer,Group}
