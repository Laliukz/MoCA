document.addEventListener("DOMContentLoaded", function() {
    const buttons = document.querySelectorAll("button.word");
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
    const transcriptionText = document.getElementById('transcriptionText');
    const comparisonProcessText = document.getElementById('comparisonProcessText');

    // Quitar todos los íconos y texto de los botones
    buttons.forEach(button => {
        button.innerHTML = '<img src="../../Logos/altavoz.png" alt="Leer" class="speaker-button">';
        button.removeAttribute('data-word');
    });

    // Mostrar palabras una por una
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
                    setTimeout(showNextWord, 1000); // 1.0 segundos entre palabras
                };
            }
        }
        showNextWord();
    }

    // Leer el contenido dentro del elemento <main> y luego iniciar la secuencia de palabras
    function readPageAndStartSequence(sequenceText, callback) {
        const mainContent = document.querySelector('main').innerText;
        const speech = new SpeechSynthesisUtterance(mainContent);
        speech.lang = 'es-ES';
        speech.onend = callback;
        window.speechSynthesis.speak(speech);
    }

    // Botones de altavoz a los elementos
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

    fetch('Seleccionadas.txt')
        .then(response => response.text())
        .then(data => {
            const words = data.split('\n').map(word => word.trim()).filter(word => word.length > 0);
            if (window.location.pathname.endsWith('memoria2.html')) {
                readPageAndStartSequence("Segundo intento", () => showWords(words));
            } else {
                readPageAndStartSequence("Primer intento", () => showWords(words));
            }
        })
        .catch(error => console.error('Error al cargar las palabras seleccionadas:', error));

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
                        compareWords(transcription.trim()); // Comparar palabras después de la transcripción
                        transcriptionText.textContent = transcription.trim(); // Mostrar la transcripción
                        transcription = ''; // Reiniciar la transcripción
                    });

                    setTimeout(() => {
                        mediaRecorder.stop();
                        recognition.stop();
                    }, 7000); // Detener la grabación después de 7 segundos
                })
                .catch(error => console.error('Error al acceder al micrófono:', error));
        }
    });

    recognition.onresult = (event) => {
        transcription += event.results[event.results.length - 1][0].transcript + ' ';
        transcriptionText.textContent = transcription.trim(); // Actualizar la transcripción en tiempo real
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
                const transcribedWords = transcription.replace(/\.$/, '').split(/[ ,]+/).map(word => word.trim().toLowerCase()).filter(word => word.length > 0);

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

                /* Mostrar resultados de la comparación
                comparisonResults.innerHTML = '<h3>Resultados de la Comparación:</h3>';
                selectedWords.forEach((word, index) => {
                    const result = transcribedWords.includes(word) ? 'Correcto' : 'Incorrecto';
                    comparisonResults.innerHTML += `<p>${word}: ${result}</p>`;
                });

                // Mostrar el proceso de comparación
                comparisonProcessText.innerHTML = `Palabras seleccionadas: ${selectedWords.join(', ')}<br>Palabras transcritas: ${transcribedWords.join(', ')}`;*/
            })
            .catch(error => console.error('Error al cargar las palabras seleccionadas:', error));
    }
});