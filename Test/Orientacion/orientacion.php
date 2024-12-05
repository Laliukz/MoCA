<?php
header("Content-Type: application/json");

// Mostrar errores para depuración
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Configuración de conexión a la base de datos
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "moca";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Conexión fallida: " . $conn->connect_error]));
}

// Crear tablas si no existen
$sql_evaluaciones = "
CREATE TABLE IF NOT EXISTS evaluaciones (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    puntaje_total INT(3) NOT NULL
)";
$conn->query($sql_evaluaciones);

$sql_respuestas = "
CREATE TABLE IF NOT EXISTS respuestas (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    evaluacion_id INT(6) UNSIGNED NOT NULL,
    pregunta VARCHAR(255) NOT NULL,
    respuesta TEXT NOT NULL,
    puntaje INT(3) NOT NULL,
    FOREIGN KEY (evaluacion_id) REFERENCES evaluaciones(id) ON DELETE CASCADE
)";
$conn->query($sql_respuestas);

// Obtener datos enviados desde el formulario
$data = json_decode(file_get_contents("php://input"), true);

// Depuración: verificar si los datos llegan correctamente
if (!$data) {
    echo json_encode(["success" => false, "message" => "Datos inválidos o mal formateados."]);
    exit();
} else {
    // Mostrar los datos recibidos para depuración
    error_log(print_r($data, true));
}

// Guardar evaluación en la tabla `evaluaciones`
$fecha = date("Y-m-d");
$puntaje_total = $data["puntaje"]; // Usamos el puntaje que viene de JavaScript
$sql = "INSERT INTO evaluaciones (fecha, puntaje_total) VALUES (?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $fecha, $puntaje_total);
$stmt->execute();
$evaluacion_id = $stmt->insert_id;

// Guardar respuestas en la tabla `respuestas`
foreach ($data as $key => $value) {
    if ($key !== 'puntaje') {
        $pregunta = ucfirst($key); // Usamos la clave como pregunta
        $respuesta = $value;
        $puntaje = ($value === $data["puntaje"]) ? 1 : 0; // Ejemplo de asignación de puntaje
        $stmt = $conn->prepare("INSERT INTO respuestas (evaluacion_id, pregunta, respuesta, puntaje) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("isss", $evaluacion_id, $pregunta, $respuesta, $puntaje);
        $stmt->execute();
    }
}

// Responder al cliente
echo json_encode(["success" => true, "message" => "Datos guardados correctamente."]);
$stmt->close();
$conn->close();
?>
