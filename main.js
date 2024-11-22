document.addEventListener("DOMContentLoaded", function() {
    const buttons = document.querySelectorAll("button.word");
    const hasFileDownloaded = sessionStorage.getItem('fileDownloaded'); // Estado de descarga de archivo

    //Mostrar palabras una por una
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

    //Guardar palabras seleccionadas en un archivo
    function saveSelectedWords(words) {
        const blob = new Blob([words.join('\n')], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Seleccionadas.txt';
        link.click();
        link.remove();
        sessionStorage.setItem('fileDownloaded', 'true');
    }

    //Secuencia de palabras con SpeechSynthesis
    function startWordSequence(words, callback) {
        const speech = new SpeechSynthesisUtterance(words);
        speech.lang = 'es-ES';
        speech.onend = callback;
        window.speechSynthesis.speak(speech);
    }

    // Leer la página y luego iniciar la secuencia de palabras
    function readPageAndStartSequence(sequenceText, callback) {
        const textToRead = document.body.innerText;
        const speech = new SpeechSynthesisUtterance(textToRead);
        speech.lang = 'es-ES';
        speech.onend = () => startWordSequence(sequenceText, callback);
        window.speechSynthesis.speak(speech);
    }

    //Botones de altavoz a los elementos
    function addSpeakerButtons() {
        const paragraphs = document.querySelectorAll('p, h1, h2');
        paragraphs.forEach(paragraph => {
            const speakerButton = paragraph.querySelector('.speaker-button');
            speakerButton.addEventListener('click', () => {
                const speech = new SpeechSynthesisUtterance(paragraph.innerText);
                speech.lang = 'es-ES';
                window.speechSynthesis.speak(speech);
            });
        });

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
                    const usedIndices = new Set();

                    function showNextWord() {
                        if (index < buttons.length) {
                            const button = buttons[index];
                            const speakerButton = button.querySelector('.speaker-button');
                            speakerButton.style.display = 'none';
                            let randomIndex;
                            do {
                                randomIndex = Math.floor(Math.random() * words.length);
                            } while (usedIndices.has(randomIndex));
                            usedIndices.add(randomIndex);
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

        window.addEventListener('beforeunload', function(e) {
            e.preventDefault();
            e.returnValue = '';
        });
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

    const speakButton = document.querySelector('#speakButton');
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
                            const usedIndices = new Set();

                            function showNextWord() {
                                if (index < buttons.length) {
                                    const button = buttons[index];
                                    const speakerButton = button.querySelector('.speaker-button');
                                    speakerButton.style.display = 'none';
                                    let randomIndex;
                                    do {
                                        randomIndex = Math.floor(Math.random() * words.length);
                                    } while (usedIndices.has(randomIndex));
                                    usedIndices.add(randomIndex);
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

    const micButton = document.getElementById('micButton');
    let mediaRecorder;
    let audioChunks = [];

    micButton.addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        } else {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    mediaRecorder = new MediaRecorder(stream);
                    mediaRecorder.start();

                    mediaRecorder.addEventListener('dataavailable', event => {
                        audioChunks.push(event.data);
                    });

                    mediaRecorder.addEventListener('stop', () => {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                        const audioUrl = URL.createObjectURL(audioBlob);
                        const link = document.createElement('a');
                        link.href = audioUrl;
                        link.download = 'grabacion.wav';
                        link.click();
                        link.remove();
                        audioChunks = [];
                    });
                })
                .catch(error => console.error('Error al acceder al micrófono:', error));
        }
    });
});