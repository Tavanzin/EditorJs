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

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $stmt = $conn->prepare("SELECT * FROM templates WHERE nome_arquivo = ?");
    $stmt->bind_param("s", $nome_arquivo);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $json = file_get_contents("php://input");
    $dados = json_decode($json, true);

    if (!isset($dados["codigo"]) || !isset($dados["nome_arquivo"])) {
        die("Erro: Dados inválidos recebidos.");
    }

    $codigo = json_encode($dados["codigo"], JSON_UNESCAPED_UNICODE);
    $nome_arquivo = preg_replace("/[^a-zA-Z0-9_-]/", "", $dados["nome_arquivo"]);
    
    if (!empty($codigo)) {
        $stmt = $conn->prepare("SELECT * FROM templates WHERE nome_arquivo = ?");
        $stmt->bind_param("s", $nome_arquivo);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $updateStmt = $conn->prepare("UPDATE templates SET codigo = ?, Ultima_alter = NOW() WHERE nome_arquivo = ?");
            $updateStmt->bind_param("ss", $codigo, $nome_arquivo);

            if ($updateStmt->execute()) {
                echo "Template atualizado com sucesso!";
            } else {
                echo "Erro ao atualizar o template: " . $updateStmt->error;
            }

            $updateStmt->close();
        } else {
            $insertStmt = $conn->prepare("INSERT INTO templates (nome_arquivo, codigo) VALUES (?, ?)");
            $insertStmt->bind_param("ss", $nome_arquivo, $codigo);

            if ($insertStmt->execute()) {
                echo "Template salvo com sucesso!";
            } else {
                echo "Erro ao salvar template: " . $insertStmt->error;
            }

            $insertStmt->close();
        }

        $stmt->close();
    } else {
        echo "Código não pode estar vazio!";
    }
}


$conn->close();