<?php
// Conectar a la base de datos
$conexion = new mysqli('localhost', 'root', 'divinerS21@_asd#', 'moca_bd');

// Verifica la conexión
if ($conexion->connect_error) {
    die("Error en la conexión: " . $conexion->connect_error);
} else {
    echo "Conexión exitosa a la base de datos.";
}

// Recibir datos del formulario
$nombre = $_POST['nombre'];
$edad = $_POST['edad'];
$correo_electronico = $_POST['correo_electronico'];
$fecha_registro = $_POST['fecha_registro'];
$medico_id = $_POST['medico_id'];

// Preparar y ejecutar la consulta SQL
$query = "INSERT INTO usuario (nombre, edad, correo_electronico, fecha_registro, medico_id_medico) 
          VALUES (?, ?, ?, ?, ?)";

$stmt = $conexion->prepare($query);
$stmt->bind_param("sissi", $nombre, $edad, $correo_electronico, $fecha_registro, $medico_id);

if ($stmt->execute()) {
    echo "Paciente registrado exitosamente.";
} else {
    echo "Error al registrar el paciente: " . $conexion->error;
}

// Cerrar conexión
$stmt->close();
$conexion->close();
?>
