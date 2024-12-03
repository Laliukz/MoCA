<?php
$servername = "localhost";
$username = "root";
$password = "";

// Crear conexión inicial sin seleccionar base de datos
$conn = new mysqli($servername, $username, $password);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Crear base de datos
$sql = "CREATE DATABASE IF NOT EXISTS moca";
$conn->query($sql);

// Seleccionar base de datos
$conn->select_db("moca");

// Crear tabla para palabras seleccionadas
$sql = "CREATE TABLE IF NOT EXISTS palabras (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    palabra VARCHAR(30) NOT NULL
)";
$conn->query($sql);

// Crear tabla para resultados de palabras
$sql = "CREATE TABLE IF NOT EXISTS resultados (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    palabra VARCHAR(30) NOT NULL,
    resultado ENUM('acierto', 'error') NOT NULL
)";
$conn->query($sql);

// Borrar palabras antiguas de la tabla palabras
$sql = "DELETE FROM palabras";
$conn->query($sql);

// Seleccionar 5 palabras aleatorias del diccionario y guardarlas en la tabla palabras
$sql = "INSERT INTO palabras (palabra) SELECT palabra FROM diccionario ORDER BY RAND() LIMIT 5";
$conn->query($sql);

// Obtener palabras seleccionadas y mostrarlas en pantalla
$sql = "SELECT palabra FROM palabras";
$result = $conn->query($sql);
$palabras = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $palabras[] = $row['palabra'];
    }
}

// Guardar palabras seleccionadas en el archivo Seleccionadas.txt
$file = fopen("../Memoria/Seleccionadas.txt", "w");
if ($file) {
    foreach ($palabras as $palabra) {
        fwrite($file, $palabra . PHP_EOL);
    }
    fclose($file);
}

echo "<h1>Palabras seleccionadas:</h1>";
echo "<ul>";
foreach ($palabras as $palabra) {
    echo "<li>" . htmlspecialchars($palabra) . "</li>";
}
echo "</ul>";

// Insertar palabras seleccionadas
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['palabras'])) {
        $palabras = $data['palabras'];
        $sql = "INSERT INTO palabras (palabra) VALUES ";
        $values = [];
        foreach ($palabras as $palabra) {
            $values[] = "('" . $conn->real_escape_string($palabra) . "')";
        }
        $sql .= implode(", ", $values);
        $conn->query($sql);
    }
}

// Insertar resultados de palabras
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['resultados'])) {
    $resultados = $_POST['resultados'];
    $sql = "INSERT INTO resultados (palabra, resultado) VALUES ";
    $values = [];
    foreach ($resultados as $resultado) {
        $palabra = $conn->real_escape_string($resultado['palabra']);
        $estado = $conn->real_escape_string($resultado['resultado']);
        $values[] = "('$palabra', '$estado')";
    }
    $sql .= implode(", ", $values);
    $conn->query($sql);
}

// Obtener palabras seleccionadas
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['type']) && $_GET['type'] === 'selected') {
    $sql = "SELECT palabra FROM palabras";
    $result = $conn->query($sql);
    $palabras = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $palabras[] = $row['palabra'];
        }
    }
    header('Content-Type: application/json');
    echo json_encode($palabras);
}

// Obtener palabras del diccionario
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['type']) && $_GET['type'] === 'dictionary') {
    $sql = "SELECT palabra FROM diccionario";
    $result = $conn->query($sql);
    $palabras = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $palabras[] = $row['palabra'];
        }
    }
    header('Content-Type: application/json');
    echo json_encode($palabras);
}

$conn->close();
?>