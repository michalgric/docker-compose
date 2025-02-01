document.addEventListener('DOMContentLoaded', () => {
    // Load highlight.js
    const highlightScript = document.createElement('script');
    highlightScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
    document.head.appendChild(highlightScript);

    // Load highlight.js CSS
    const highlightCSS = document.createElement('link');
    highlightCSS.rel = 'stylesheet';
    highlightCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css';
    document.head.appendChild(highlightCSS);

    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    const loadingSpinner = document.querySelector('.loading-spinner');
    const submitButton = chatForm.querySelector('button');

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (message === '') return;

        appendMessage('You', message);
        userInput.value = '';

        // Disable input and show loading spinner
        userInput.disabled = true;
        submitButton.disabled = true;
        loadingSpinner.style.display = 'block';

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            const data = await response.json();
            if (response.ok) {
                appendMessage('Langflow', data.response);
            } else {
                appendMessage('Error', data.response);
            }
        } catch (error) {
            appendMessage('Error', 'Failed to communicate with the server.');
            console.error('Error:', error);
        } finally {
            // Re-enable input and hide loading spinner
            userInput.disabled = false;
            submitButton.disabled = false;
            loadingSpinner.style.display = 'none';
            userInput.focus();
        }
    });

    function appendMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');

        // Process message for code blocks
        let formattedMessage = message;
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        
        formattedMessage = escapeHTML(message).replace(codeBlockRegex, (match, language, code) => {
            language = language || 'plaintext';
            const template = document.getElementById('copy-button-template');
            const copyBtn = template.content.cloneNode(true);
            return `<div class="code-wrapper">
                <pre><code class="language-${language}">${code.trim()}</code></pre>
                ${copyBtn.querySelector('button').outerHTML}
            </div>`;
        });

        // Replace regular line breaks with <br>
        formattedMessage = formattedMessage.replace(/\n/g, '<br>');

        messageElement.innerHTML = `<strong>${sender}:</strong> ${formattedMessage}`;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;

        // Apply syntax highlighting to code blocks
        messageElement.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // Initialize highlight.js when it's loaded
    highlightScript.onload = () => {
        hljs.highlightAll();
    };

    // Add click event listener for copy buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.copy-btn')) {
            const button = e.target.closest('.copy-btn');
            const codeBlock = button.parentElement.querySelector('code');
            const code = codeBlock.textContent;

            navigator.clipboard.writeText(code).then(() => {
                button.classList.add('copied');
                setTimeout(() => {
                    button.classList.remove('copied');
                }, 2000);
            });
        }
    });
});
