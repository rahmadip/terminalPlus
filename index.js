document.body.className = 'bg-neutral-950 text-neutral-50 font-[Plus_Jakarta_Sans] tracking-wide leading-relaxed';


const terminalContainer = document.getElementById('terminalContainer');
terminalContainer.className = 'h-dvh max-w-screen-sm mx-auto flex flex-col justify-between p-4';


// CHAT CONTAINER
const chatContainer = document.getElementById('chatContainer');
chatContainer.className = 'hide-scrollbar flex-1 overflow-y-auto flex flex-col gap-2 mb-2';


// PROMPT CONTAINER
const promptContainer = document.getElementById('promptContainer');
promptContainer.className = 'flex flex-col border border-neutral-50/50 rounded-xl overflow-hidden';


// TEXT PROMPT
const textPrompt = document.getElementById('textPrompt');
textPrompt.className = 'w-full h-24 p-3 bg-transparent placeholder:text-neutral-50/50 text-neutral-50/50 text-sm border-0 ring-0 overflow-y-auto hide-scrollbar';
textPrompt.spellcheck = false;
textPrompt.autocorrect = false;
textPrompt.autocapitalize = 'off';
textPrompt.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendBtn.click();
    }
});


// BUTTON CONTAINER
const btnContainer = document.getElementById('btnContainer');
btnContainer.className = 'flex justify-between items-center';
const classBtn = 'h-12 flex flex-1 items-center justify-center text-neutral-50/50 hover:bg-neutral-50/10 hover:text-neutral-50 active:bg-neutral-50/10 active:text-neutral-50  cursor-pointer';


// GLOBAL VARIABLE AKUMULASI TEKS FINAL
let globalAccumulatedFinalText = '';

// --- GLOBAL ARRAY ATTACH FILE ---
let attachedFiles = [];

// --- GLOBAL MUTE STATUS ---
let isMuted = false;


// --- CONTAINER FILE ATTACH ---
const fileAttachmentContainer = document.createElement('div');
fileAttachmentContainer.id = 'fileAttachmentContainer';
fileAttachmentContainer.className = 'flex flex-wrap gap-2 px-3 pt-3';
fileAttachmentContainer.style.display = 'none';
promptContainer.prepend(fileAttachmentContainer);


// --- DYNAMIC INPUT FILE HIDDEN ---
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.multiple = true;
fileInput.accept = '*/*';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);


// ADD BUTTON FUNCTION
const addBtn = document.getElementById('addBtn');
addBtn.className = classBtn;
addBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (event) => {
    const files = event.target.files;
    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            attachedFiles.push(file);

            const fileBlockTag = document.createElement('div');
            fileBlockTag.className = 'file-attachment-tag p-2 rounded-sm bg-neutral-700 text-neutral-50/75 text-xs flex items-center';
            fileBlockTag.textContent = file.name;

            fileAttachmentContainer.style.display = 'flex';
            fileAttachmentContainer.appendChild(fileBlockTag);
        }
        fileInput.value = '';
    }
});


// VOICE BUTTON FUNCTION
const voiceBtn = document.getElementById('voiceBtn');
voiceBtn.className = classBtn;
let recognition;
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'id-ID';

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscriptForThisSession = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcriptSegment = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscriptForThisSession += transcriptSegment;
            } else {
                interimTranscript += transcriptSegment;
            }
        }

        if (finalTranscriptForThisSession) {
            globalAccumulatedFinalText += (globalAccumulatedFinalText ? ' ' : '') + finalTranscriptForThisSession;
        }

        let displayText = globalAccumulatedFinalText;
        if (interimTranscript) {
            if (displayText && !displayText.endsWith(' ')) {
                displayText += ' ';
            }
            displayText += interimTranscript;
        }
        textPrompt.value = displayText;
    };

    recognition.onend = () => {
        console.log('Voice recognition ended.');
        textPrompt.value = globalAccumulatedFinalText;
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        voiceBtn.textContent = 'voice';
        alert('Terjadi kesalahan saat pengenalan suara: ' + event.error + '. Pastikan mikrofon Anda berfungsi dan berikan izin akses.');
    };

    voiceBtn.addEventListener('mousedown', () => {
        try {
            recognition.start();
            console.log('Voice recognition started...');
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                alert('Akses mikrofon ditolak. Mohon izinkan akses mikrofon di pengaturan browser Anda.');
            } else if (error.name === 'AbortError') {
            } else {
                alert('Gagal memulai pengenalan suara. Coba lagi.');
            }
        }
    });

    voiceBtn.addEventListener('mouseup', () => {
        recognition.stop();
        console.log('Voice recognition stopped.');
    });

    window.addEventListener('beforeunload', () => {
        if (recognition) {
            recognition.stop();
        }
    });

} else {
    voiceBtn.textContent = 'Voice (N/A)';
    voiceBtn.disabled = true;
    voiceBtn.style.opacity = '0.5';
    alert('Browser Anda tidak mendukung Web Speech API. Fitur suara tidak akan berfungsi.');
}

// SEND BUTTON FUNCTION
const sendBtn = document.getElementById('sendBtn');
sendBtn.className = classBtn;
sendBtn.addEventListener('click', () => {
    const trimPrompt = textPrompt.value.trim();
    const lowerCaseTrimPrompt = trimPrompt.toLowerCase()
        if (trimPrompt === '' && attachedFiles.length === 0){
        return;
    }

    if (lowerCaseTrimPrompt === 'clear') {
        chatContainer.innerHTML = '';
        textPrompt.value = '';
        globalAccumulatedFinalText = '';
        attachedFiles = [];
        fileAttachmentContainer.innerHTML = '';
        fileAttachmentContainer.style.display = 'none';
        window.speechSynthesis.cancel();
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return;
    }
    
    const chatPrompt = document.createElement('div');
    chatPrompt.className = 'p-2 text-sm text-neutral-50/50 border border-px rounded-l-xl rounded-tr-xl w-fit self-end tracking-wide whitespace-pre-wrap flex flex-col gap-1';

    if (attachedFiles.length > 0) {
        const chatFileTagsContainer = document.createElement('div');
        chatFileTagsContainer.className = 'flex flex-wrap gap-1';
        
        attachedFiles.forEach(file => {
            const fileBlockTag = document.createElement('div');
            fileBlockTag.className = 'file-attachment-tag p-1 px-2 rounded-lg bg-neutral-700 text-neutral-50/75 text-xs flex items-center gap-1';
            fileBlockTag.textContent = file.name;
            chatFileTagsContainer.appendChild(fileBlockTag);
        });
        chatPrompt.appendChild(chatFileTagsContainer);
    }

    if (trimPrompt !== '') {
        const chatPromptText = document.createElement('div');
        chatPromptText.className = 'text-neutral-50/75 whitespace-pre-wrap';
        chatPromptText.textContent = trimPrompt;
        chatPrompt.appendChild(chatPromptText);
    }

    chatContainer.appendChild(chatPrompt);

    const chatResponse = document.createElement('div');
    chatResponse.className = 'p-2 text-sm text-neutral-50 leading-loose tracking-wide text-pretty hyphens-auto whitespace-pre-wrap';
    chatResponse.innerHTML = executePrompt(trimPrompt, attachedFiles);
    chatContainer.appendChild(chatResponse);

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        if (!isMuted) {
            const utterance = new SpeechSynthesisUtterance(chatResponse.textContent); 
            utterance.lang = 'id-ID';
            window.speechSynthesis.speak(utterance);
        }
    } else {
        console.warn('Browser tidak mendukung Web Speech API (SpeechSynthesis). Fitur suara balasan tidak akan berfungsi.');
    }

    textPrompt.value = '';
    globalAccumulatedFinalText = '';
    attachedFiles = [];
    fileAttachmentContainer.innerHTML = '';
    fileAttachmentContainer.style.display = 'none';
    
    chatContainer.scrollTop = chatContainer.scrollHeight;
});

// COMMAND PROMPT
function executePrompt(userPrompt, files) {
    const lowerCasePrompt = userPrompt.toLowerCase().trim();

    let responseHtml = '';

    if (lowerCasePrompt === 'help') {
        responseHtml = `<b>COMMAND LIST:</b><br><b><i>go</i></b> : lorem ipsum<br><b><i>download</i></b> : lorem ipsum<br><b><i>list</i></b> : lorem ipsum<br><b><i>clear</i></b> : lorem ipsum<br><b><i>mute</i></b> : lorem ipsum`;
    } else if (lowerCasePrompt === 'mute') {
        isMuted = !isMuted;
        responseHtml = `Voice output is now ${isMuted ? 'Muted' : 'Unmuted'}.`;
    } else if (files.length > 0) {
        responseHtml = "Anda mengirim file. Saat ini saya hanya bisa menampilkan teks lorem ipsum untuk balasan. Fitur pemrosesan file akan datang.";
    } else {
        responseHtml = "Command not found";
    }

    return responseHtml;
}