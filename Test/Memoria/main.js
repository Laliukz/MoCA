document.addEventListener("DOMContentLoaded", function() {
    const buttons = document.querySelectorAll("button.word");
    const hasFileDownloaded = sessionStorage.getItem('fileDownloaded'); // Estado de descarga de archivo
    const micButton = document.getElementById('micButton');
    const comparisonResults = document.createElement('div');
    comparisonResults.id = 'comparisonResults';
    document.body.appendChild(comparisonResults);
    let mediaRecorder;
    let audioChunks = [];
    let transcription = '';
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'es-ES';
    recognition.interimResults = false;

    // Quitar todos los íconos y texto de los botones
    buttons.forEach(button => {
        button.innerHTML = '<img src="../../Logos/altavoz.png" alt="Leer" class="speaker-button">';
        button.removeAttribute('data-word');
    });

    //Mostrar palabras una por una
    function showWords(words) {
        let index = 0;
        function showNextWord() {
            if (index < buttons.length) {
                const button = buttons[index];
                const speakerButton = button.querySelector('.speaker-button');
                speakerButton.style.display = 'none';
                button.textContent = words[index];
                button.dataset.word = words[index]; // Liga la palabra con el botón
                const speech = new SpeechSynthesisUtterance(words[index]);
                speech.lang = 'es-ES';
                window.speechSynthesis.speak(speech);
                speech.onend = () => {
                    button.textContent = "";
                    speakerButton.style.display = 'inline';
                    index++;
                    setTimeout(showNextWord, 1500); // 1.5 segundos entre palabras
                };
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

    //Guardar transcripción en un archivo
    function saveTranscription(text) {
        const blob = new Blob([text], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Transcripcion.txt';
        link.click();
        link.remove();
        compareWords(text); // Comparar palabras después de guardar la transcripción
    }

    //Secuencia de palabras con SpeechSynthesis
    function startWordSequence(words, callback) {
        const speech = new SpeechSynthesisUtterance(words);
        speech.lang = 'es-ES';
        speech.onend = callback;
        window.speechSynthesis.speak(speech);
    }

    // Leer el contenido dentro del elemento <main> y luego iniciar la secuencia de palabras
    function readPageAndStartSequence(sequenceText, callback) {
        const mainContent = document.querySelector('main').innerText;
        const speech = new SpeechSynthesisUtterance(mainContent);
        speech.lang = 'es-ES';
        speech.onend = () => startWordSequence(sequenceText, callback);
        window.speechSynthesis.speak(speech);
    }

    //Botones de altavoz a los elementos
    function addSpeakerButtons() {
        const paragraphs = document.querySelectorAll('p, h1, h2');
        paragraphs.forEach(paragraph => {
            const speakerButton = paragraph.querySelector('.speaker-button');
            if (speakerButton) {
                speakerButton.addEventListener('click', () => {
                    const speech = new SpeechSynthesisUtterance(paragraph.innerText);
                    speech.lang = 'es-ES';
                    window.speechSynthesis.speak(speech);
                });
            }
        });

        buttons.forEach(button => {
            const speakerButton = button.querySelector('.speaker-button');
            if (speakerButton) {
                speakerButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const speech = new SpeechSynthesisUtterance(button.textContent);
                    speech.lang = 'es-ES';
                    window.speechSynthesis.speak(speech);
                });
            }
        });
    }

    addSpeakerButtons();

    if (!window.location.pathname.endsWith('memoria2.html')) {
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
                            button.dataset.word = selectedWord; // Liga la palabra con el botón
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

    if (window.location.pathname.endsWith('memoria2.html')) {
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
        if (window.location.pathname.endsWith('memoria2.html')) {
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
                                    button.dataset.word = selectedWord; // Liga la palabra con el botón
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

    micButton.addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            recognition.stop();
            micButton.src = "../../Logos/microfono.png"; // Cambiar icono a microfono
        } else {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    mediaRecorder = new MediaRecorder(stream);
                    mediaRecorder.start();
                    recognition.start();
                    micButton.src = "../../Logos/microfono_on.png"; // Cambiar icono a microfono_on

                    mediaRecorder.addEventListener('dataavailable', event => {
                        audioChunks.push(event.data);
                    });

                    mediaRecorder.addEventListener('stop', () => {
                        audioChunks = [];
                        micButton.src = "../../Logos/microfono.png"; // Cambiar icono a microfono
                        saveTranscription(transcription); // Guardar la transcripción completa y comparar palabras
                        transcription = ''; // Reiniciar la transcripción
                    });

                    setTimeout(() => {
                        mediaRecorder.stop();
                        recognition.stop();
                    }, 8000); // Detener la grabación después de 8 segundos
                })
                .catch(error => console.error('Error al acceder al micrófono:', error));
        }
    });

    recognition.onresult = (event) => {
        transcription += event.results[event.results.length - 1][0].transcript + ' ';
    };

    recognition.onend = () => {
        recognition.stop();
    };

    // Comparar palabras y cambiar el icono del botón
    function compareWords(transcription) {
        fetch('Seleccionadas.txt')
            .then(response => response.text())
            .then(data => {
                const selectedWords = data.split('\n').map(word => word.trim().toLowerCase()).filter(word => word.length > 0);
                const transcribedWords = transcription.split(/[ ,]+/).map(word => word.trim().toLowerCase()).filter(word => word.length > 0);

                buttons.forEach((button, index) => {
                    const word = button.dataset.word ? button.dataset.word.trim().toLowerCase() : '';
                    const icon = document.createElement('img');
                    icon.classList.add('icon'); // Agrega la clase icon
                    if (selectedWords.includes(word) && transcribedWords.includes(word)) {
                        icon.src = "../../Logos/p.png";
                    } else {
                        icon.src = "../../Logos/x.png";
                    }
                    button.appendChild(icon);
                });

                // Mostrar resultados de la comparación
                comparisonResults.innerHTML = '<h3>Resultados de la Comparación:</h3>';
                selectedWords.forEach((word, index) => {
                    const result = transcribedWords.includes(word) ? 'Correcto' : 'Incorrecto';
                    comparisonResults.innerHTML += `<p>${word}: ${result}</p>`;
                });
            })
            .catch(error => console.error('Error al cargar las palabras seleccionadas:', error));
    }
});