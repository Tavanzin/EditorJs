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

$conn->close();