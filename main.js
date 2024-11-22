document.addEventListener("DOMContentLoaded", function() {
    const buttons = document.querySelectorAll("button.word");
    const hasFileDownloaded = sessionStorage.getItem('fileDownloaded');
    const speakButton = document.getElementById('speakButton');

    function showWords(words) {
        let index = 0;
        function showNextWord() {
            if (index < buttons.length) {
                const button = buttons[index];
                const speakerButton = button.querySelector('.speaker-button');
                speakerButton.style.display = 'none';
                button.textContent = words[index];
                const speech = new SpeechSynthesisUtterance(words[index]);
                speech.lang = 'es-ES';
                window.speechSynthesis.speak(speech);
                setTimeout(() => {
                    button.textContent = "";
                    speakerButton.style.display = 'inline';
                    index++;
                    showNextWord();
                }, 1000);
            }
        }
        showNextWord();
    }

    function saveSelectedWords(words) {
        const blob = new Blob([words.join('\n')], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Seleccionadas.txt';
        link.click();
        link.remove();
        sessionStorage.setItem('fileDownloaded', 'true');
    }

    function startWordSequence(words, callback) {
        const speech = new SpeechSynthesisUtterance(words);
        speech.lang = 'es-ES';
        speech.onend = callback;
        window.speechSynthesis.speak(speech);
    }

    function readPageAndStartSequence(sequenceText, callback) {
        const textToRead = document.body.innerText;
        const speech = new SpeechSynthesisUtterance(textToRead);
        speech.lang = 'es-ES';
        speech.onend = () => startWordSequence(sequenceText, callback);
        window.speechSynthesis.speak(speech);
    }

    function addSpeakerButtons() {
        buttons.forEach(button => {
            const speakerButton = button.querySelector('.speaker-button');
            speakerButton.addEventListener('click', (event) => {
                event.stopPropagation();
                const speech = new SpeechSynthesisUtterance(button.textContent);
                speech.lang = 'es-ES';
                window.speechSynthesis.speak(speech);
            });
        });
    }

    addSpeakerButtons();

    if (!window.location.pathname.endsWith('P2.html')) {
        if (!hasFileDownloaded) {
            fetch('Diccionario.txt')
                .then(response => response.text())
                .then(data => {
                    const words = data.split('\n').map(word => word.trim()).filter(word => word.length > 0);
                    let index = 0;
                    const selectedWords = [];

                    function showNextWord() {
                        if (index < buttons.length) {
                            const button = buttons[index];
                            const speakerButton = button.querySelector('.speaker-button');
                            speakerButton.style.display = 'none';
                            const randomIndex = Math.floor(Math.random() * words.length);
                            const selectedWord = words[randomIndex];
                            selectedWords.push(selectedWord);
                            button.textContent = selectedWord;
                            const speech = new SpeechSynthesisUtterance(selectedWord);
                            speech.lang = 'es-ES';
                            window.speechSynthesis.speak(speech);
                            setTimeout(() => {
                                button.textContent = "";
                                speakerButton.style.display = 'inline';
                                index++;
                                showNextWord();
                            }, 1000);
                        } else {
                            saveSelectedWords(selectedWords);
                        }
                    }

                    readPageAndStartSequence("Primer intento", showNextWord);
                })
                .catch(error => console.error('Error al cargar el diccionario:', error));
        } else {
            fetch('Seleccionadas.txt')
                .then(response => response.text())
                .then(data => {
                    const words = data.split('\n').map(word => word.trim()).filter(word => word.length > 0);
                    readPageAndStartSequence("Primer intento", () => showWords(words));
                })
                .catch(error => console.error('Error al cargar las palabras seleccionadas:', error));
        }
    }

    if (window.location.pathname.endsWith('P2.html')) {
        fetch('Seleccionadas.txt')
            .then(response => response.text())
            .then(data => {
                const words = data.split('\n').map(word => word.trim()).filter(word => word.length > 0);
                readPageAndStartSequence("Segundo intento", () => showWords(words));
            })
            .catch(error => console.error('Error al cargar las palabras seleccionadas:', error));
    }

    speakButton.addEventListener('click', () => {
        if (window.location.pathname.endsWith('P2.html')) {
            readPageAndStartSequence("Segundo intento", () => {
                fetch('Seleccionadas.txt')
                    .then(response => response.text())
                    .then(data => {
                        const words = data.split('\n').map(word => word.trim()).filter(word => word.length > 0);
                        showWords(words);
                    })
                    .catch(error => console.error('Error al cargar las palabras seleccionadas:', error));
            });
        } else {
            readPageAndStartSequence("Primer intento", () => {
                if (!hasFileDownloaded) {
                    fetch('Diccionario.txt')
                        .then(response => response.text())
                        .then(data => {
                            const words = data.split('\n').map(word => word.trim()).filter(word => word.length > 0);
                            let index = 0;
                            const selectedWords = [];

                            function showNextWord() {
                                if (index < buttons.length) {
                                    const button = buttons[index];
                                    const speakerButton = button.querySelector('.speaker-button');
                                    speakerButton.style.display = 'none';
                                    const randomIndex = Math.floor(Math.random() * words.length);
                                    const selectedWord = words[randomIndex];
                                    selectedWords.push(selectedWord);
                                    button.textContent = selectedWord;
                                    const speech = new SpeechSynthesisUtterance(selectedWord);
                                    speech.lang = 'es-ES';
                                    window.speechSynthesis.speak(speech);
                                    setTimeout(() => {
                                        button.textContent = "";
                                        speakerButton.style.display = 'inline';
                                        index++;
                                        showNextWord();
                                    }, 1000);
                                } else {
                                    saveSelectedWords(selectedWords);
                                }
                            }

                            showNextWord();
                        })
                        .catch(error => console.error('Error al cargar el diccionario:', error));
                } else {
                    fetch('Seleccionadas.txt')
                        .then(response => response.text())
                        .then(data => {
                            const words = data.split('\n').map(word => word.trim()).filter(word => word.length > 0);
                            showWords(words);
                        })
                        .catch(error => console.error('Error al cargar las palabras seleccionadas:', error));
                }
            });
        }
    });
});


