document.body.className = 'bg-neutral-950 text-neutral-50 font-[Plus_Jakarta_Sans] tracking-wide leading-relaxed';


const terminalContainer = document.getElementById('terminalContainer');
terminalContainer.className = 'h-dvh max-w-screen-sm mx-auto flex flex-col justify-between p-4';


// CHAT CONTAINER
const chatContainer = document.getElementById('chatContainer');
chatContainer.className = 'hide-scrollbar flex-1 overflow-y-auto flex flex-col gap-2 mb-2';


// PROMPT CONTAINER
const promptContainer = document.getElementById('promptContainer');
promptContainer.className = 'p-2 flex flex-col border border-neutral-50/50 rounded-xl gap-4';


// TEXT PROMPT
const textPrompt = document.getElementById('textPrompt');
textPrompt.className = 'w-full h-15 p-0 bg-transparent placeholder:text-neutral-50/50 text-neutral-50/50 text-sm border-0 ring-0 overflow-y-auto hide-scrollbar';
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
btnContainer.className = 'flex justify-between items-center gap-6';
const classBtn = 'size-9 flex flex-1 items-center justify-center rounded-lg text-neutral-50/50 hover:bg-neutral-50/10 text-sm cursor-pointer';


// GLOBAL VARIABLE AKUMULASI TEKS FINAL
let globalAccumulatedFinalText = '';

// --- GLOBAL ARRAY ATTACH FILE ---
let attachedFiles = [];


// --- CONTAINER FILE ATTACH ---
const fileAttachmentContainer = document.createElement('div');
fileAttachmentContainer.id = 'fileAttachmentContainer';
fileAttachmentContainer.className = 'flex flex-wrap gap-2 mb-2';
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
    const files = event.target.files; // Dapatkan daftar file yang dipilih
    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            attachedFiles.push(file); // Simpan objek File yang sebenarnya

            // Buat elemen div untuk "blok nama file"
            const fileBlockTag = document.createElement('div');
            // <<< SPOT UNTUK CLASSNAME UNTUK STYLING >>>
            fileBlockTag.className = 'file-attachment-tag p-1 px-2 rounded-lg bg-neutral-700 text-neutral-50/75 text-xs flex items-center gap-1';
            // Isi teks dengan nama file
            fileBlockTag.textContent = file.name;

            // Tambahkan "blok nama file" ke container
            fileAttachmentContainer.appendChild(fileBlockTag);
        }
        // Bersihkan nilai input file agar memilih file yang sama lagi tetap memicu event 'change'
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
        if (interimTranscript) { // Jika ada teks live (belum final)
            if (displayText && !displayText.endsWith(' ')) {
                displayText += ' ';
            }
            displayText += interimTranscript;
        }
        textPrompt.value = displayText;
    };

    recognition.onend = () => {
        voiceBtn.textContent = 'voice';
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
            voiceBtn.textContent = 'Listening...';
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
        if (trimPrompt === '' && attachedFiles.length === 0){
        // Jika tidak ada teks dan tidak ada file, jangan lakukan apa-apa
        return;
    }

    // Buat elemen bubble chat utama (chatPrompt)
    const chatPrompt = document.createElement('div');
    // Class untuk styling bubble chat, ditambahkan 'flex flex-col gap-1' agar kontennya tersusun vertikal
    chatPrompt.className = 'p-2 text-sm text-neutral-50/50 border border-px rounded-l-xl rounded-tr-xl w-fit self-end tracking-wide whitespace-pre-wrap flex flex-col gap-1';

    // <<< Bagian: Menambahkan File Attachments ke chatPrompt (jika ada) >>>
    if (attachedFiles.length > 0) {
        const chatFileTagsContainer = document.createElement('div');
        // Styling untuk container tag file di dalam bubble chat (misalnya gap lebih kecil)
        chatFileTagsContainer.className = 'flex flex-wrap gap-1';
        
        attachedFiles.forEach(file => {
            const fileBlockTag = document.createElement('div');
            // Menggunakan className yang sama dengan fileBlockTag di input area
            fileBlockTag.className = 'file-attachment-tag p-1 px-2 rounded-lg bg-neutral-700 text-neutral-50/75 text-xs flex items-center gap-1';
            fileBlockTag.textContent = file.name;
            chatFileTagsContainer.appendChild(fileBlockTag);
        });
        chatPrompt.appendChild(chatFileTagsContainer);
    }

    // <<< Bagian: Menambahkan Teks dari textPrompt ke chatPrompt (jika ada) >>>
    if (trimPrompt !== '') {
        const chatPromptText = document.createElement('div');
        // Class untuk styling teks di dalam bubble, agar warna dan wrapping tetap sama
        chatPromptText.className = 'text-neutral-50/75 whitespace-pre-wrap';
        chatPromptText.textContent = trimPrompt;
        chatPrompt.appendChild(chatPromptText);
    }

    // Tambahkan bubble chat yang sudah lengkap ke chatContainer
    chatContainer.appendChild(chatPrompt);

    // --- LOGIC RESPON BOT (tetap sama) ---
    const chatResponse = document.createElement('div');
    chatResponse.className = 'p-2 text-sm text-neutral-50 leading-loose tracking-wide text-pretty hyphens-auto whitespace-pre-wrap';
    chatResponse.textContent = 'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
    chatContainer.appendChild(chatResponse);

    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(chatResponse.textContent);
        utterance.lang = 'id-ID';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    } else {
        console.warn('Browser tidak mendukung Web Speech API (SpeechSynthesis). Fitur suara balasan tidak akan berfungsi.');
    }

    // --- RESET BAGIAN INPUT (textPrompt dan attachment files) ---
    textPrompt.value = '';
    globalAccumulatedFinalText = '';
    attachedFiles = []; // Hapus semua file dari array
    fileAttachmentContainer.innerHTML = ''; // Hapus semua tag file dari tampilan
    
    chatContainer.scrollTop = chatContainer.scrollHeight;
});






//     if (trimPrompt !== ''){
//         const chatPrompt = document.createElement('div');
//         chatPrompt.className = 'p-2 text-sm text-neutral-50/50 border border-px rounded-l-xl rounded-tr-xl w-fit self-end tracking-wide whitespace-pre-wrap';
//         chatPrompt.textContent = trimPrompt;
//         chatContainer.appendChild(chatPrompt);

//         const chatResponse = document.createElement('div');
//         chatResponse.className = 'p-2 text-sm text-neutral-50 leading-loose tracking-wide text-pretty hyphens-auto whitespace-pre-wrap';
//         chatResponse.textContent = 'lorem ipsum';
//         chatContainer.appendChild(chatResponse);

//         if ('speechSynthesis' in window) {
//            const utterance = new SpeechSynthesisUtterance(chatResponse.textContent);
//            utterance.lang = 'id-ID';
//            utterance.rate = 1.2;
//            utterance.pitch = 1.0;
//            window.speechSynthesis.cancel();
//            window.speechSynthesis.speak(utterance);
//         } else {
//             console.warn('Browser tidak mendukung Web Speech API (SpeechSynthesis). Fitur suara balasan tidak akan berfungsi.');
//         }

//         textPrompt.value = '';
//         globalAccumulatedFinalText = '';
//         attachedFiles = [];
//         fileAttachmentContainer.innerHTML = ''; 
//         chatContainer.scrollTop = chatContainer.scrollHeight;
//     }
// });