

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('speakButton').addEventListener('click', () => {
        const content = document.body.innerText;
        const speech = new SpeechSynthesisUtterance(content);
        speech.lang = 'es-ES';
        window.speechSynthesis.speak(speech);
    });    

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

    // Leer el contenido de elementos específicos al hacer clic en los botones de altavoz
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
    }

    addSpeakerButtons();

    // Manejar clic en el botón del micrófono
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
                        compareWords(transcription.trim() + ' '); // Comparar palabras después de la transcripción
                        transcription = ''; // Reiniciar la transcripción
                    });

                    setTimeout(() => {
                        mediaRecorder.stop();
                        recognition.stop();
                    }, 10000); // Detener la grabación después de 10 segundos
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

    // Comparar palabras y actualizar el DOM con resultados
    function compareWords(transcription) {
        fetch('Respuestas.txt')
            .then(response => response.text())
            .then(data => {
                const selectedWords = data.split('\n').map(word => word.trim().toLowerCase()).filter(word => word.length > 0);
                const transcribedWords = (transcription + 'word').split(/[ ,]+/).map(word => word.trim().toLowerCase()).filter(word => word.length > 0);

                const paragraphs = document.querySelectorAll('p, h1, h2');
                paragraphs.forEach(paragraph => {
                    const word = paragraph.dataset.word ? paragraph.dataset.word.trim().toLowerCase() : '';
                    const icon = document.createElement('img');
                    icon.classList.add('icon'); // Agrega la clase icon
                    if (selectedWords.includes(word) && transcribedWords.includes(word)) {
                        icon.src = "../../Logos/x.png";
                    } else {
                        icon.src = "../../Logos/p.png";
                    }
                    paragraph.appendChild(icon);
                });

                // Mostrar resultados de la comparación
                comparisonResults.innerHTML = '<h3>Resultados de la Comparación:</h3>';
                selectedWords.forEach((word) => {
                    const result = transcribedWords.includes(word) ? 'Correcto' : 'Incorrecto';
                    comparisonResults.innerHTML += `<p>${word}: ${result}</p>`; // Corregir la concatenación
                });
            })
            .catch(error => console.error('Error al cargar las palabras seleccionadas:', error));
    }
});
