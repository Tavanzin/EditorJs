<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "editorjs";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    if (isset($_GET['id']) && is_numeric($_GET['id'])) {
        $template_id = $_GET['id'];

        $stmt = $conn->prepare("SELECT versao FROM versao_templates WHERE template_id = ?");
        $stmt->bind_param("i", $template_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $versoes = [];
        
        while ($row = $result->fetch_assoc()) {
            $versoes[] = $row['versao'];
        }

        $stmt->close();

        echo json_encode($versoes);
    } else {
        echo json_encode(["erro" => "ID do template inválido."]);
    }
}

$conn->close();