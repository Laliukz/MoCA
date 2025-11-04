# MoCA

Proyecto web para la evaluación cognitiva (implementación educativa y de prueba).

Este repositorio contiene una implementación en PHP/HTML/CSS/JS de pruebas tipo MoCA (Montreal Cognitive Assessment) organizadas por módulos: memoria, orientación, recuerdo diferido, y un flujo básico de pacientes y médicos para registro/consulta de resultados.

## Contenido

- `guardar_paciente.php` - Script para guardar datos de paciente (formulario PHP simple).
- `login/` - Pantallas de login para médicos.
- `Paciente_main/` - Interfaz principal para pacientes y módulos de registro/visualización de resultados.
- `Test/`, `Memoria/`, `Orientacion/`, `Recuerdo_diferido/` - Módulos de pruebas con HTML, CSS, JS y ficheros de respuestas.
- `Logos/`, `sign-up/` - Recursos estáticos y páginas de registro.

## Requisitos

- Windows con WAMP (o cualquier stack Apache + PHP + MySQL). Probado en WAMP local.
- PHP 5.6+ (preferible PHP 7.x o 8.x) — revisar y adaptar según la versión instalada.
- Navegador moderno (Chrome/Edge/Firefox).

## Estructura de carpetas (resumen)

- `Paciente_main/Registro/` - Formulario de registro de pacientes.
- `Paciente_main/Resultados/` - Páginas para ver resultados.
- `Test/`, `Memoria/`, `Orientacion/`, `Recuerdo_diferido/` - Módulos de pruebas con sus recursos.
- Archivos `.php` en la raíz como `guardar_paciente.php` encargados de persistencia básica.

Fíjate en ficheros de datos incluidos (por ejemplo `Seleccionadas.txt`, `Respuestas.txt`, `Transcripcion.txt`) que se usan como persistencia simple o para pruebas; considerarlos para migración a base de datos si se requiere seguridad/escala.

## Uso

- Para realizar un test: abre la página HTML del módulo (por ejemplo `Test/iniciar_test.html`) y sigue las instrucciones en pantalla.
- Para registrar un paciente: usa el formulario en `Paciente_main/Registro/registro_paciente.html`.
- Para visualizar resultados: `Paciente_main/Resultados/ver_resultados.html`.

## Tecnologías de voz y grabación

Algunos tests incluidos en este proyecto hacen uso de tecnologías de captura y detección de voz, grabación y transcripción. Estas funcionalidades están implementadas de forma básica y de prueba; los archivos relevantes donde se encuentra lógica o datos relacionados son, entre otros:

- `Test/Memoria/main.js` — lógica del módulo de memoria que puede manejar grabación/transcripción.
- `Test/Memoria/Transcripcion.txt` — ejemplo/resultado de transcripción.
- `Test/Memoria/Seleccionadas.txt` y `Test/Seleccionadas.txt` — ficheros de persistencia de respuestas seleccionadas.
- `Test/Orientacion/orientacion.js` — lógica del módulo de orientación (incluye manejo de respuestas y posible uso de audio).
- `Test/Orientacion/Respuestas.txt` — respuestas esperadas o guardadas para el módulo de orientación.

## Estado del proyecto y desarrollo futuro

Este proyecto está en un estado incompleto / de prototipo. La persistencia actual usa ficheros planos y hay lógica de front-end y PHP básica para registrar y mostrar resultados. En el futuro se planea:

- Migrar la persistencia a una base de datos relacional (MySQL/MariaDB) y diseñar un esquema para pacientes, tests y resultados.
- Mejorar la autenticación y autorización para usuarios (médicos/pacientes), incluyendo contraseñas hasheadas y sesiones seguras.
- Sustituir las implementaciones de voz/trascripción por integraciones con APIs de reconocimiento más robustas y seguras.

## Archivos importantes

- `guardar_paciente.php` — lógica para guardar; revisar y adaptar.
- `Paciente_main/registro_paciente.html` — formulario de registro.
- `Memoria/main.js`, `Orientacion/orientacion.js` — lógica JS de los tests.


