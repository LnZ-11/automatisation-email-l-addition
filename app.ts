require("dotenv").config();
const axios = require('axios');
const cron = require('cron');

// Configuration API L'Addition
const urlAddition = 'https://api.laddition.fr/endpoint'; // Remplace par l'URL de l'API
const headersAddition = {
  'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
};

// Configuration API Mailjet
const apiKey = 'YOUR_MAILJET_API_KEY';
const apiSecret = 'YOUR_MAILJET_API_SECRET';
const urlMailjet = 'https://api.mailjet.com/v3/REST/contacts';

// Fonction pour récupérer les emails depuis L'Addition

async function fetchEmailsFromLAddition() {
    try {
        const response = await axios.get("https://api.laddition.com/emails", {
            headers: { Authorization: `Bearer ${process.env.L_ADDITION_API_KEY}` }
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
