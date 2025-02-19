<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
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
  if (isset($_GET['ID'])) {
    $id = $_GET['ID'];
    $stmt = $conn->prepare("DELETE FROM templates WHERE id = ?");
    $stmt->bind_param("s", $id);

    
    if ($stmt->execute()) {
      $result = $conn->query("SELECT COUNT(*) AS total FROM templates");
      $row = $result->fetch_assoc();

      $auto_increment_reset = false;
      
      if ($row['total'] == 0) {
        $conn->query("ALTER TABLE templates AUTO_INCREMENT = 1");
        $auto_increment_reset = true;
      }
      
        echo json_encode(["success" => true, 
        "message" => "Template deletado com sucesso.",
        "reset" => $auto_increment_reset
      ]);
      } else {
        echo json_encode(["success" => false, "message" => "Erro ao deletar template: " . $stmt->error]);
      }
      
      $stmt->close();
  } else {
      echo json_encode(["success" => false, "message" => "id do arquivo não fornecido."]);
  }
}

$conn->close();