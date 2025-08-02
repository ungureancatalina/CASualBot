const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const menuBtn = document.getElementById('menu-btn');
const menuPopup = document.getElementById('menu-popup');
const closeMenuBtn = document.getElementById('close-menu');
const questionsList = document.getElementById('questions-list');
// const suggestionsDiv = document.getElementById('suggestions'); // removed

// All hardcoded questions (sync with backend)
const allQuestions = [
  'Ce se întâmplă atunci când un asigurat, deși este internat în spital, trebuie să plătească medicamentele din bani proprii?',
  'Cum pot verifica dacă sunt asigurat la sănătate?',
  'Câte consultații pot face cu o singură trimitere medicală?',
  'Ce estecardul naţional desănătate?',
  'Cine poate fi coasigurat pe cardul meu?',
  'Pot primi servicii dacă nu am cardul de sănătate fizic?',
  'Care este valabilitatea cardului național de sănătate?',
  'Cine poate recomanda îngrijiri medicale la domiciliu pentru un pacient imobilizat?',
  'Care este durata maximă pentru care un adult poate beneficia de îngrijiri medicale la domiciliu?',
  'Când se pot efectua consultațiile preventive la medicul de familie pentru adulți între 40 și 60 de ani?',
  'Este necesar bilet de trimitere pentru consultațiile de planificare familială?',
  'Câte zile poate beneficia un pacient cu paralizie cerebrală de proceduri de recuperare?',
  'Poate medicul de familie elibera recomandări pentru dispozitive medicale?',
  'Ce investigații sunt incluse în pachetul anual de prevenție pentru persoane de peste 60 de ani?',
  'Ce se întâmplă dacă pacientul greșește de 5 ori codul PIN al cardului de sănătate?',
  'Ce servicii dentare sunt gratuite pentru copiii sub 18 ani?',
  'Care este valabilitatea biletului de trimitere pentru investigații paraclinice în cazul consultațiilor de prevenție?'
];

let lastBotWasFallback = false;

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function appendMessage(text, sender, time = new Date(), typing = false) {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message ' + sender;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  if (typing) {
    bubble.innerHTML = '<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>';
  } else {
    bubble.textContent = text;
  }
  const timestamp = document.createElement('div');
  timestamp.className = 'timestamp';
  timestamp.textContent = formatTime(time);
  msgDiv.appendChild(bubble);
  msgDiv.appendChild(timestamp);
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return { msgDiv, bubble };
}

// Typing animation for bot reply
async function typeBotMessage(fullText, msgDiv, bubble, time = new Date()) {
  bubble.textContent = '';
  for (let i = 0; i < fullText.length; i++) {
    bubble.textContent += fullText[i];
    chatWindow.scrollTop = chatWindow.scrollHeight;
    await new Promise(r => setTimeout(r, 14 + Math.random() * 18));
  }
  // update timestamp in case of long messages
  msgDiv.querySelector('.timestamp').textContent = formatTime(time);

  // If fallback, show escalate button
  if (lastBotWasFallback) {
    showEscalateButton(msgDiv);
    lastBotWasFallback = false;
  }
}

function showEscalateButton(msgDiv) {
  let btn = document.createElement('button');
  btn.className = 'escalate-btn';
  btn.textContent = 'Contactează un operator';
  btn.onclick = () => {
    openSupportModal();
  };
  msgDiv.appendChild(btn);
}

// Support modal logic
function openSupportModal() {
  document.getElementById('support-modal').classList.remove('hidden');
}
function contactBack() {
  document.querySelector('.support-email').style.display = 'none';
  document.querySelector('.contact-back').style.display = 'none';
  document.getElementById('support-thankyou').classList.remove('hidden');
}
function closeSupportModal() {
  document.getElementById('support-modal').classList.add('hidden');
  // Reset modal for next use
  document.querySelector('.support-email').style.display = '';
  document.querySelector('.contact-back').style.display = '';
  document.getElementById('support-thankyou').classList.add('hidden');
}

// Show welcome message from cas chatbot
window.addEventListener('DOMContentLoaded', () => {
  appendMessage("Salut! Eu sunt CASualBot, asistentul tau virtual. Cum te pot ajuta?", 'bot');
  appendMessage("💡 Sfat: Poți scrie fără diacritice (ș, ă, î, ț) și voi înțelege întrebarea ta!", 'bot');
});

// function showRandomSuggestions() { ... } // removed
// function sendQuestion(question) { ... } // removed

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const question = userInput.value.trim();
  if (!question) return;
  appendMessage(question, 'user');
  userInput.value = '';

  // Show typing animation
  const { msgDiv, bubble } = appendMessage('', 'bot', new Date(), true);

  try {
    const res = await fetch('/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    const data = await res.json();
    // Check if fallback
    lastBotWasFallback = data.answer && data.answer.startsWith('Sorry');
    await new Promise(r => setTimeout(r, 400 + Math.random() * 400)); // Simulate thinking
    await typeBotMessage(data.answer, msgDiv, bubble);
  } catch (err) {
    lastBotWasFallback = true;
    await typeBotMessage('Error connecting to server.', msgDiv, bubble);
  }
});

// Menu popup logic
menuBtn.addEventListener('click', () => {
  menuPopup.classList.remove('hidden');
  renderQuestionsList();
});
closeMenuBtn.addEventListener('click', () => {
  menuPopup.classList.add('hidden');
});

function renderQuestionsList() {
  questionsList.innerHTML = '';
  allQuestions.forEach(q => {
    const li = document.createElement('li');
    li.textContent = q;
    li.onclick = () => {
      menuPopup.classList.add('hidden');
      userInput.value = q;
      chatForm.dispatchEvent(new Event('submit'));
    };
    questionsList.appendChild(li);
  });
} 