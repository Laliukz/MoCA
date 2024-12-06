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
        const weekDays = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    
        // Crear un arreglo para almacenar los valores capturados
        const capturedValues = [];
        let score = 0; // Variable para el puntaje
    
        // Asignar valores transcritos a los inputs y capturarlos
        inputs.dia.value = transcribedWords.find(word => !isNaN(word) && word > 0 && word <= 31) || '';
        capturedValues.push(inputs.dia.value);
    
        inputs.mes.value = transcribedWords.find(word => monthNames.includes(word)) || '';
        capturedValues.push(inputs.mes.value);
    
        inputs.año.value = transcribedWords.find(word => !isNaN(word) && word >= 1900 && word <= new Date().getFullYear()) || '';
        capturedValues.push(inputs.año.value);
    
        inputs.diaSemana.value = transcribedWords.find(word => weekDays.includes(word)) || '';
        capturedValues.push(inputs.diaSemana.value);
    
        // Usamos coincidencia más flexible para lugar y ciudad
        inputs.lugar.value = transcribedWords.find(word => word.includes('buap')) || '';
        capturedValues.push(inputs.lugar.value);
    
        inputs.ciudad.value = transcribedWords.find(word => word.includes('puebla')) || '';
        capturedValues.push(inputs.ciudad.value);
    
        console.log("Valores capturados:", capturedValues);
    
        // Comparar y mostrar resultados
        let resultHtml = '<h3>Resultados de la comparación:</h3><ul>';
        Object.keys(inputs).forEach(key => {
            const userAnswer = inputs[key].value.toLowerCase().trim();
            const expectedAnswer = expectedAnswers[key].toLowerCase().trim();
    
            if (userAnswer === expectedAnswer) {
                resultHtml += `<li>${key}: <span style="color:green">Correcto</span></li>`;
                score++; // Incrementar el puntaje si es correcto
            } else {
                resultHtml += `<li>${key}: <span style="color:red">Incorrecto</span> (Esperado: ${expectedAnswer})</li>`;
            }
        });
    
        resultHtml += `</ul><h3>Puntaje total: ${score}/6</h3>`;
        comparisonResults.innerHTML = resultHtml;
    
        console.log("Puntaje final:", score);
        console.log("Resultados mostrados en pantalla.");

        // Enviar los resultados a PHP
        saveResults({
            dia: inputs.dia.value,
            mes: inputs.mes.value,
            año: inputs.año.value,
            diaSemana: inputs.diaSemana.value,
            lugar: inputs.lugar.value,
            ciudad: inputs.ciudad.value,
            puntaje: score,
            fecha: new Date().toISOString() // Fecha del envío
        });
    }

    function saveResults(data) {
        console.log("Enviando datos a PHP:", data);  // Verificar los datos que se envían
    
        // Crear el formulario dinámicamente
        let form = document.createElement("form");
        form.method = "POST";
        form.action = "orientacion.php";
        
        // Añadir los datos como campos ocultos al formulario
        Object.keys(data).forEach(key => {
            let input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = data[key];
            form.appendChild(input);
        });
        
        // Añadir un campo JSON si es necesario
        let inputData = document.createElement("input");
        inputData.type = "hidden";
        inputData.name = "respuestas";
        inputData.value = JSON.stringify(data);
        form.appendChild(inputData);
        
        // Añadir el formulario al cuerpo del documento y enviarlo
        document.body.appendChild(form);
        form.submit();  // Enviar el formulario
    }
    
    
});
