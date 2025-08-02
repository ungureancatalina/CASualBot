const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const port = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
const qaPairs = [

  { 
    question: 'Ce se întâmplă atunci când un asigurat, deși este internat în spital, trebuie să plătească medicamentele din bani proprii?',
    answer: 'Dacă ești internat într-un spital public și plătești din greșeală medicamente sau investigații care ar fi trebuit să fie gratuite, spitalul este obligat să-ți dea banii înapoi, dacă faci o cerere.' }  ,
  {
    question: 'Cum pot verifica dacă sunt asigurat la sănătate?',
    answer: 'Poți verifica statusul de asigurat pe site-ul oficial CNAS: https://siui.casan.ro/asigurati/'
  },
  {
    question: 'Câte consultații pot face cu o singură trimitere medicală?',
    answer: 'Pentru un episod de boală acută/subacută, se pot acorda maximum 3 consultații la medicul specialist în ambulatoriu de specialitate cu aceeasi trimitere.'
  },
  {
    question: 'Ce estecardul naţional desănătate?',
    answer: 'Cardul de sănătate este instrumentul, personal și netransmisibil, de acces la servicii medicale, medicamente, dispozitive medicale din pachetul de bază.'
  },
  {
    question: 'Cine poate fi coasigurat pe cardul meu?',
    answer: 'Soțul/soția, părinții fără venituri, copiii — vezi condițiile pe https://www.cnas.ro/page/coasigurati.html'
  },
  {
    question: 'Pot primi servicii dacă nu am cardul de sănătate fizic?',
    answer: 'Da. Statusul tău e verificat electronic.'
  },
  {
    question: 'Care este valabilitatea cardului național de sănătate?',
    answer: 'Cardul este valabil 7 ani.'
  },
  {
    question: "Cine poate recomanda îngrijiri medicale la domiciliu pentru un pacient imobilizat?",
    answer: "Îngrijirile la domiciliu pot fi recomandate de medicii de familie, medicii specialiști din ambulatoriu sau din spital, aflați în contract cu casele de asigurări de sănătate."
  },
  {
    question: "Care este durata maximă pentru care un adult poate beneficia de îngrijiri medicale la domiciliu?",
    answer: "Un adult poate beneficia de maximum 90 de zile de îngrijiri medicale la domiciliu în ultimele 11 luni, în mai multe etape de îngrijire."
  },
  {
    question: "Când se pot efectua consultațiile preventive la medicul de familie pentru adulți între 40 și 60 de ani?",
    answer: "Pentru această categorie de vârstă, se oferă anual un pachet de prevenție pentru depistarea precoce a altor afecțiuni cronice, diferite de cele deja diagnosticate."
  },
  {
    question: "Este necesar bilet de trimitere pentru consultațiile de planificare familială?",
    answer: "Nu. Consultațiile pentru planificare familială nu necesită bilet de trimitere, indiferent dacă pacientul este asigurat sau nu."
  },
  {
    question: "Câte zile poate beneficia un pacient cu paralizie cerebrală de proceduri de recuperare?",
    answer: "Pacienții cu paralizie cerebrală beneficiază de maximum 42 de zile pe an de proceduri terapeutice de recuperare în ambulatoriu."
  },
  {
    question: "Poate medicul de familie elibera recomandări pentru dispozitive medicale?",
    answer: "Da, medicul de familie poate elibera recomandări pentru dispozitive medicale de protezare stomii și incontinență urinară, cu excepția cateterului urinar."
  },
  {
    question: "Ce investigații sunt incluse în pachetul anual de prevenție pentru persoane de peste 60 de ani?",
    answer: "Pachetul include hemoleucogramă completă, colesterol, glicemie, evaluare cardiovasculară, oncologică și, suplimentar, investigația DXA."
  },
  {
    question: "Ce se întâmplă dacă pacientul greșește de 5 ori codul PIN al cardului de sănătate?",
    answer: "Cardul se blochează, iar furnizorul de servicii medicale trebuie să contacteze helpdesk-ul CNAS pentru deblocare."
  },
  {
    question: "Ce servicii dentare sunt gratuite pentru copiii sub 18 ani?",
    answer: "Copiii sub 18 ani beneficiază gratuit de consultație la fiecare 6 luni și decontare 100% pentru toate serviciile dentare din pachetul de bază."
  },
  {
    question: "Care este valabilitatea biletului de trimitere pentru investigații paraclinice în cazul consultațiilor de prevenție?",
    answer: "Biletul de trimitere pentru investigații paraclinice recomandate în consultații de prevenție este valabil până la 60 de zile calendaristice."
  }
];

const removeDiacritics = (str) => str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

function significantWords(str) {
  return removeDiacritics(str)
    .split(/\s+/)
    .filter(w => w.length >= 2); // Reduced minimum length to 2 characters
}

function calculateMatchScore(userQuestion, qaQuestion) {
  const userWords = significantWords(userQuestion);
  const qaWords = significantWords(qaQuestion);
  
  if (userWords.length === 0) return 0;
  
  // Count exact word matches
  const exactMatches = userWords.filter(w => qaWords.includes(w));
  
  // Count partial matches (words that contain user words)
  const partialMatches = userWords.filter(userWord => 
    qaWords.some(qaWord => qaWord.includes(userWord) || userWord.includes(qaWord))
  );
  
  // Calculate score based on both exact and partial matches
  const exactScore = exactMatches.length;
  const partialScore = partialMatches.length * 0.5; // Partial matches count for less
  
  return exactScore + partialScore;
}

app.post('/ask', (req, res) => {
  const userQuestion = req.body.question || '';
  
  if (!userQuestion.trim()) {
    return res.json({ answer: "Te rog să introduci o întrebare." });
  }
  
  // Find the best match
  let bestMatch = null;
  let bestScore = 0;
  
  qaPairs.forEach(qa => {
    const score = calculateMatchScore(userQuestion, qa.question);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = qa;
    }
  });
  
  // Require at least 1 significant word match or a good partial match
  if (bestScore >= 2.5) {
    res.json({ answer: bestMatch.answer });
  } else {
    res.json({ answer: "Îmi pare rău, nu știu răspunsul la asta. Te rog să contactezi serviciul de asistență pentru mai mult ajutor." });
  }
});

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Optional API route (for chatbot etc)
app.get('/api/qa', (req, res) => {
  res.json(qaPairs);
});

// Catch-all to return index.html for SPA-style routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
}); 