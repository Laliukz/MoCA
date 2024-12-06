<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Crear conexión
$conn = new mysqli('localhost', 'root', '', 'moca');

// Comprobar la conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Verificar si los datos han sido enviados
if (!isset($_POST['respuestas'])) {
    echo json_encode(['status' => 'error', 'message' => 'Datos inválidos o vacíos']);
    exit;
}

// Decodificar las respuestas desde el formulario (si fuera un JSON en un campo oculto)
$data = json_decode($_POST['respuestas'], true);

// Comenzar la transacción para asegurar que todas las operaciones sean atómicas
$conn->begin_transaction();

try {
    // Suponiendo que tienes un test ID (puedes asignarlo de alguna manera o generar uno)
    $id_test = uniqid();  // O usar un valor específico si es necesario

    // Insertar las respuestas proporcionadas
    foreach ($data['respuestas'] as $respuesta) {
        $id_pregunta = $respuesta['id_pregunta'];
        $valor_respuesta = $conn->real_escape_string($respuesta['valor_respuesta']);
        $ubicacion_geografica = $conn->real_escape_string($respuesta['ubicacion_geografica']);
        $nivel_confianza = $respuesta['nivel_confianza'];

        // Insertar los datos en la tabla 'respuesta_orientacion'
        $sql = "INSERT INTO respuesta_orientacion (id_test, id_pregunta, valor_respuesta, ubicacion_geografica, nivel_confianza)
                VALUES ('$id_test', '$id_pregunta', '$valor_respuesta', '$ubicacion_geografica', '$nivel_confianza')";

        if (!$conn->query($sql)) {
            throw new Exception("Error al insertar en respuesta_orientacion: " . $conn->error);
        }
    }

    // Confirmar la transacción
    $conn->commit();

    // Respuesta de éxito
    echo json_encode(['status' => 'success', 'message' => 'Datos guardados correctamente']);

} catch (Exception $e) {
    // En caso de error, revertir la transacción
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => 'Error al guardar los datos: ' . $e->getMessage()]);
}

// Cerrar la conexión
$conn->close();
?>
