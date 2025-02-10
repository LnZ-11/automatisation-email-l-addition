require("dotenv").config();
import axios from "axios";
const cron = require('cron');

// Configuration API L'Addition
const urlAddition = 'https://api.laddition.fr/endpoint'; // Remplace par l'URL de l'API
const headersAddition = {
  'Authorization': `Bearer ${process.env.L_ADDITION_API_KEY}`,
};

// Configuration API Mailjet
const apiKey = process.env.API_MAILJET_KEY!;
const apiSecret = process.env.API_MAILJET_SECRET!;
const urlMailjet = 'https://api.mailjet.com/v3/REST/contacts';

if (!apiKey || !apiSecret) {
  throw new Error("API Mailjet key and secret must be defined in environment variables.");
}

// Fonction pour récupérer les emails depuis L'Addition

async function fetchEmailsFromLAddition() {
    try {
        const response = await axios.get(urlAddition, {
            headers: headersAddition
        });

        if (response.data && Array.isArray(response.data.emails)) {
            return response.data.emails;
        } else {
            console.log("Aucune adresse e-mail trouvée.");
            return [];
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des e-mails :", error);
        return [];
    }
}


// Fonction pour ajouter les emails dans Mailjet
async function addEmailsToMailjet(emails) {
  for (const email of emails) {
    const payload = {
      Email: email,
    };
    
    try {
      const response = await axios.post(urlMailjet, payload, {
        auth: {
          username: apiKey,
          password: apiSecret
        },
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.status === 200) {
        console.log(`Email ${email} ajouté avec succès à Mailjet.`);
      } else {
        console.log(`Erreur d'ajout pour l'email ${email}`);
      }
    } catch (error) {
      console.error(`Erreur d'ajout pour ${email}:`, error);
    }
  }
}

// Planifier l'exécution quotidienne




const job = new cron.schedule("0 2 * * *", async () => {
    console.log("Démarrage du script de synchronisation des emails...");
    const emails = await fetchEmailsFromLAddition();
    
    if (emails.length > 0) {
        await addEmailsToMailjet(emails);
    } else {
        console.log("Aucun nouvel e-mail à synchroniser.");
    }
}, {
    timezone: "Europe/Paris"
});


// Démarrer le job
job.start();
