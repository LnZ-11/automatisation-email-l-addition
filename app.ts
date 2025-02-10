require("dotenv").config();
const axios = require('axios');
const cron = require('node-cron');
const Mailjet = require('node-mailjet');
const mailjet = new Mailjet({
  apiKey: process.env.API_MAILJET_KEY,
  apiSecret: process.env.API_MAILJET_SECRET
});




// Configuration API L'Addition
// const urlAddition = 'https://api.laddition.fr/endpoint'; // Remplace par l'URL de l'API
// const headersAddition = {
//   'Authorization': `Bearer ${process.env.L_ADDITION_API_KEY}`,
// };

// Configuration API Mailjet
const apiKey = process.env.API_MAILJET_KEY;
const apiSecret = process.env.API_MAILJET_SECRET;
const urlMailjet = 'https://api.mailjet.com/v3/REST/contacts';

if (!apiKey || !apiSecret) {
  throw new Error("API Mailjet key and secret must be defined in environment variables.");
}

// Fonction pour récupérer les emails depuis L'Addition

// async function fetchEmailsFromLAddition() {
//     try {
//         const response = await axios.get(urlAddition, {
//             headers: headersAddition
//         });

//         if (response.data && Array.isArray(response.data.emails)) {
//             return response.data.emails;
//         } else {
//             console.log("Aucune adresse e-mail trouvée.");
//             return [];
//         }
//     } catch (error) {
  //         console.error("Erreur lors de la récupération des e-mails :", error);
  //         return [];
  //     }
  // }
  
  const emailList = ["lyes.lattari@gmail.com", "lasbeurthiziri@gmail.com"]

// Fonction pour ajouter les emails dans Mailjet

async function addEmailsToMailjet(emails) {
  const urlMailjet = "https://api.mailjet.com/v3/REST/contact"; // Vérifie que c'est bien cette URL
  const apiKey = process.env.API_MAILJET_KEY;
  const apiSecret = process.env.API_MAILJET_SECRET;

  for (const email of emails) {
    const payload = { Email: email };

    try {
      const response = await axios.post(urlMailjet, payload, {
        auth: {
          username: apiKey,
          password: apiSecret
        },
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === 201) {
        console.log(`✅ Email ${email} ajouté avec succès à Mailjet.`);
      } else {
        console.log(`⚠️ Problème avec l'email ${email}:`, response.data);
      }
    } catch (error) {
      console.error(`❌ Erreur d'ajout pour ${email}:`, error.response ? error.response.data : error.message);
    }
  }
}


// Planifier l'exécution quotidienne
const job = cron.schedule("0 0 * * *", async () => {
  mailjet.get('user')
  .request()
  .then(response => console.log('Connexion réussie ✅', response.body))
  .catch(err => console.error('Erreur de connexion ❌', err));
  console.log("Démarrage du script de synchronisation des emails...");
  if (emailList.length > 0) {
  await addEmailsToMailjet(emailList);
  }
  else {
  console.log("Aucun nouvel e-mail à synchroniser.");
  }
  timezone: "Europe/Paris"
});


// Démarrer le job
job.start();
