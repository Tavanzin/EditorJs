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
    if (isset($_GET['id'])) {
      $id = $_GET['id'];

      if (isset($_GET['versao']) && floatval($_GET['versao']) > 0) {
        $versao = floatval($_GET['versao']);
        $stmt = $conn->prepare("SELECT codigo, nome_arquivo FROM versao_templates WHERE versao = ? AND template_id = ?");
        $stmt->bind_param("di", $versao, $id);
      } else {
        $stmt = $conn->prepare("SELECT codigo, nome_arquivo FROM templates WHERE id = ?");
        $stmt->bind_param("i", $id);
      }
      
      $stmt->execute();
      $result = $stmt->get_result();
      
      $template = [];
      if ($row = $result->fetch_assoc()){
          $template[] = [
             "codigo" => json_decode($row["codigo"]),
             "nome_arquivo" => isset($row["nome_arquivo"]) ? $row["nome_arquivo"] : null
          ];
      }      

    echo json_encode($template);
    $stmt->close();
  } else {
    $stmt = $conn->prepare("SELECT id, nome_arquivo, codigo, Ultima_alter FROM templates");
    $stmt->execute();
    $result = $stmt->get_result();
    $templates = [];
    while ($row = $result->fetch_assoc()) {
      $templates[] = [
        "id" => $row["id"],
        "nome_arquivo" => $row["nome_arquivo"],
        "codigo" => json_decode($row["codigo"]),
        "ultima_alter" => $row["Ultima_alter"]
      ];
    }
    echo json_encode($templates);
    $stmt->close();
  }
}

$conn->close();