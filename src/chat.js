const API_KEY = import.meta.env.VITE_API_KEY;
const API_URL = import.meta.env.VITE_API_URL;

const messages = [];
let isGenerating = false;
let selectedModel = 'provider-2/gpt-4.1';

// Services down message :
// Toggle to true when API is down

// Important : change this to false when the services are available 
const isApiDown = false;

const apiDownBanner = document.getElementById('api-alert-banner');

const apiDownChatMessage = `
🚧 Service Temporarily Unavailable 🚧

Thank you so much for your support, everyone!
Due to very high traffic, it's difficult to manage the load.
The API is currently under maintenance.
We appreciate your patience and support ❤️

— GPT4Unlimited Team
`;


// DOM Elements
const messagesDiv = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const statusDiv = document.getElementById('status');
// Dropdown
const modelDropdown = document.getElementById('model-dropdown');
const dropdownBtn = document.getElementById('dropdown-btn');
const dropdownContent = modelDropdown.querySelector('.dropdown-content');
const dropdownOptions = dropdownContent.querySelectorAll('.dropdown-option');
const selectedModelLabel = document.getElementById('selected-model-label');
const selectedModelIcon = document.getElementById('selected-model-icon');
const toast = document.getElementById('toast');

// Dropdown logic
dropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    modelDropdown.classList.toggle('open');
});
dropdownOptions.forEach(opt => {
    opt.addEventListener('click', () => {
        dropdownOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedModel = opt.getAttribute('data-model');
        selectedModelLabel.textContent = opt.getAttribute('data-label');
        selectedModelIcon.textContent = opt.getAttribute('data-icon');
        modelDropdown.classList.remove('open');
        showToast(`You are now using ${opt.getAttribute('data-label')}`);
    });
});
document.body.addEventListener('click', () => {
    modelDropdown.classList.remove('open');
});

// Toast notification
function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2200);
}

// Add message to chat with animation
function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `mb-4 ${role === 'user' ? 'text-right' : 'text-left'} chat-bubble-anim`;
    messageDiv.innerHTML = `
        <div class="inline-block max-w-[80%] p-4 rounded-2xl shadow-md transition-all duration-300 transform hover:scale-105 ${
            role === 'user' 
                ? 'bg-fbbf24 text-white ml-auto' 
                : 'bg-[#23243a] text-gray-100 mr-auto border border-[#312e81]'
        }">
            ${content}
        </div>
    `;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Handle API request
async function generateResponse(prompt) {
    statusDiv.textContent = 'AI is thinking...';
    isGenerating = true;
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: [
                    ...messages,
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const assistantMessage = data.choices[0].message.content;
        messages.push({ role: 'assistant', content: assistantMessage });
        addMessage('assistant', assistantMessage);
    } catch (error) {
        console.error('Error:', error);
        addMessage('assistant', `Error: ${error.message}`);
    } finally {
        statusDiv.textContent = '';
        isGenerating = false;
    }
}

// Handle user input
// async function handleSend() {
//     const prompt = userInput.value.trim();
//     if (!prompt || isGenerating) return;
//     addMessage('user', prompt);
//     messages.push({ role: 'user', content: prompt });
//     userInput.value = '';
//     await generateResponse(prompt);
// }
async function handleSend() {
    const prompt = userInput.value.trim();
    if (!prompt || isGenerating) return;

    if (isApiDown) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'mb-4 text-left chat-bubble-anim';
        warningDiv.innerHTML = `
            <div class="api-down-message inline-block max-w-[80%] ml-0">
                ${apiDownChatMessage}
            </div>
        `;
        messagesDiv.appendChild(warningDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        return;
    }

    addMessage('user', prompt);
    messages.push({ role: 'user', content: prompt });
    userInput.value = '';
    await generateResponse(prompt);
}


// Event Listeners
sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Share button
document.getElementById('share-btn').addEventListener('click', async () => {
    const shareData = {
        title: 'GPT4Unlimited',
        text: 'Check out this free, modern AI chat assistant powered by GPT-4!',
        url: window.location.href
    };
    if (navigator.share) {
        await navigator.share(shareData);
    } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard!');
    }
});


// Back to top button
const backToTopBtn = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopBtn.style.display = 'flex';
    } else {
        backToTopBtn.style.display = 'none';
    }
});
backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Feedback form thank you message
const feedbackForm = document.getElementById('feedback-form');
const feedbackMessage = document.getElementById('feedback-message');

if (feedbackForm) {
    feedbackForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const data = new FormData(feedbackForm);
        fetch(feedbackForm.action, {
            method: 'POST',
            body: data,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                feedbackMessage.textContent = "Thank you for your feedback!";
                feedbackForm.reset();
            } else {
                feedbackMessage.textContent = "Oops! There was a problem submitting your feedback.";
            }
            setTimeout(() => {
                feedbackMessage.textContent = "";
            }, 4000);
        }).catch(() => {
            feedbackMessage.textContent = "Oops! There was a problem submitting your feedback.";
            setTimeout(() => {
                feedbackMessage.textContent = "";
            }, 4000);
        });
    });
} 
if (isApiDown && apiDownBanner) {
    apiDownBanner.classList.remove('hidden');
}
