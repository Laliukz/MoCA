document.addEventListener("DOMContentLoaded", function () {
    const synth = window.speechSynthesis; // Control global de speech synthesis
    let isSpeaking = false; // Variable para rastrear el estado actual

    // Función para detener cualquier síntesis en curso
    function stopSpeaking() {
        if (synth.speaking) {
            synth.cancel();
            isSpeaking = false;
        }
    }

    // Botón para leer toda la página
    document.getElementById('speakButton').addEventListener('click', () => {
        stopSpeaking(); // Detenemos cualquier síntesis en curso
        const content = document.body.innerText;
        const speech = new SpeechSynthesisUtterance(content);
        speech.lang = 'es-ES';
        isSpeaking = true;
        speech.onend = () => isSpeaking = false;
        synth.speak(speech);
    });

    function addSpeakerButtons() {
        const paragraphs = document.querySelectorAll('p, h1, h2');
        paragraphs.forEach(paragraph => {
            const speakerButton = paragraph.querySelector('.speaker-button');
            if (speakerButton) {
                speakerButton.addEventListener('click', () => {
                    stopSpeaking(); // Detenemos cualquier síntesis en curso
                    const speech = new SpeechSynthesisUtterance(paragraph.textContent.trim());
                    speech.lang = 'es-ES';
                    isSpeaking = true;
                    speech.onend = () => isSpeaking = false;
                    synth.speak(speech);
                });
            }
        });
    }

    addSpeakerButtons();

    // Micrófono
    const micButton = document.getElementById('micButton');
    const comparisonResults = document.createElement('div');
    comparisonResults.id = 'comparisonResults';
    document.body.appendChild(comparisonResults);

    let transcription = '';
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'es-ES';
    recognition.interimResults = false;

    micButton.addEventListener('click', () => {
        if (recognition) {
            stopSpeaking(); // Asegurarnos de detener cualquier síntesis antes de activar el reconocimiento
            recognition.start();
            micButton.src = "../../Logos/microfono_on.png";
        }
    });

    recognition.onresult = (event) => {
        transcription = event.results[event.results.length - 1][0].transcript;
        console.log("Transcripción capturada:", transcription);
        compareWords(transcription);
    };

    recognition.onend = () => {
        micButton.src = "../../Logos/microfono.png";
    };

    function compareWords(transcription) {
        const transcribedWords = transcription.split(/\s+/).map(word => word.toLowerCase().trim());
        console.log("Palabras transcritas:", transcribedWords);

        const inputs = {
            dia: document.getElementById('dia'),
            mes: document.getElementById('mes'),
            año: document.getElementById('año'),
            diaSemana: document.getElementById('dia-semana'),
            lugar: document.getElementById('lugar'),
            ciudad: document.getElementById('ciudad')
        };

        const expectedAnswers = {
            dia: new Date().getDate().toString(),
            mes: new Date().toLocaleString('es-ES', { month: 'long' }),
            año: new Date().getFullYear().toString(),
            diaSemana: new Date().toLocaleString('es-ES', { weekday: 'long' }),
            lugar: 'buap',
            ciudad: 'puebla'
        };

        const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

        // Asignar valores transcritos a los inputs
        inputs.dia.value = transcribedWords.find(word => !isNaN(word) && word > 0 && word <= 31) || '';
        inputs.mes.value = transcribedWords.find(word => monthNames.includes(word)) || '';
        inputs.año.value = transcribedWords.find(word => !isNaN(word) && word >= 1900 && word <= new Date().getFullYear()) || '';
        inputs.diaSemana.value = transcribedWords.find(word => ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].includes(word)) || '';
        inputs.lugar.value = transcribedWords.find(word => word.includes('buap')) || '';
        inputs.ciudad.value = transcribedWords.find(word => word.includes('puebla')) || '';

        // Comparar y mostrar resultados
        let resultHtml = '<h3>Resultados de la comparación:</h3><ul>';
        Object.keys(inputs).forEach(key => {
            const userAnswer = inputs[key].value.toLowerCase().trim();
            const expectedAnswer = expectedAnswers[key].toLowerCase().trim();

            if (userAnswer === expectedAnswer) {
                resultHtml += `<li>${key}: <span style="color:green">Correcto</span></li>`;
            } else {
                resultHtml += `<li>${key}: <span style="color:red">Incorrecto</span> (Esperado: ${expectedAnswer})</li>`;
            }
        });

        resultHtml += '</ul>';
        comparisonResults.innerHTML = resultHtml;

        console.log("Resultados mostrados en pantalla.");
    }
});
