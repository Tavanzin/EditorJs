<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

function moveTempImages($id) {
    $sourceDir = "uploads/temp/";
    $destDir = "uploads/" . trim($id, "/") . "/";
    if (!is_dir($sourceDir)) {
        return;
    }
    if (!is_dir($destDir)) {
        mkdir($destDir, 0777, true);
    }
    foreach (glob($sourceDir . "*") as $file) {
        $newPath = $destDir . basename($file);
        if (file_exists($newPath)) {
            unlink($newPath);
        }
        if (!rename($file, $newPath)) {
            error_log("Não foi possível mover o arquivo $file para $newPath");
        }
    }
}

function copyUsedTemplateImages($oldId, $newId, $codigo) {
    $data = json_decode($codigo, true);
    if (!isset($data['blocks']) || !is_array($data['blocks'])) {
        return; 
    }
    $usedImages = [];
    
    foreach ($data['blocks'] as $block) {
        if ($block['type'] == 'image' && isset($block['data']['file']['url'])) {
            $url = $block['data']['file']['url'];
            if (strpos($url, "uploads/{$oldId}/") !== false) {
                $usedImages[] = basename($url);
            }
        }
    }
    $usedImages = array_unique($usedImages);
    $sourceDir = "uploads/" . $oldId . "/";
    $destDir = "uploads/" . $newId . "/";

    if (!is_dir($sourceDir)) {
        return;
    }
    if (!is_dir($destDir)) {
        mkdir($destDir, 0777, true);
    }
    foreach ($usedImages as $file) {
        $sourceFile = $sourceDir . $file;
        $destFile = $destDir . $file;
        if (file_exists($sourceFile)) {
            if (!copy($sourceFile, $destFile)) {
                error_log("Não foi possível copiar o arquivo $sourceFile para $destFile");
            }
        }
    }
}

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "editorjs";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents("php://input");
    $dados = json_decode($json, true);
    if (!isset($dados["codigo"]) || !isset($dados["nome_arquivo"])) {
        die("Erro: Dados inválidos recebidos.");
    }
    $codigo = json_encode($dados["codigo"], JSON_UNESCAPED_UNICODE);
    $nome_arquivo = preg_replace("/[^a-zA-Z0-9_-]/", "", $dados["nome_arquivo"]);
    $stmt = $conn->prepare("SELECT * FROM templates WHERE nome_arquivo = ?");
    $stmt->bind_param("s", $nome_arquivo);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $template_id = $row['id'];
        $codigo_anterior = $row['codigo'];
        $stmt_versao = $conn->prepare("SELECT COALESCE(MAX(versao), '0') AS versao_atual FROM versao_templates WHERE template_id = ?");
        $stmt_versao->bind_param("i", $template_id);
        $stmt_versao->execute();
        $res_versao = $stmt_versao->get_result();
        $versao_atual = $res_versao->fetch_assoc()["versao_atual"];
        $stmt_versao->close();
        if ($versao_atual == "0") {
            $nova_versao = 1.0;
        } else {
            $versao_atual_float = floatval($versao_atual);
            $versao_partes = explode('.', number_format($versao_atual_float, 1, '.', ''));
            $major = intval($versao_partes[0]);
            $minor = isset($versao_partes[1]) ? intval($versao_partes[1]) : 0;
            if ($minor < 9) {
                $minor++;
            } else {
                $major++;
                $minor = 0;
            }
            $nova_versao = floatval("{$major}.{$minor}");
        }
        $stmt_hist = $conn->prepare("INSERT INTO versao_templates (template_id, versao, nome_arquivo, codigo) VALUES (?, ?, ?, ?)");
        $stmt_hist->bind_param("idss", $template_id, $nova_versao, $nome_arquivo, $codigo_anterior);
        $stmt_hist->execute();
        $stmt_hist->close();
        $codigoAtualizado = str_replace("uploads\/temp\/", "uploads\/" . $template_id . "\/", $codigo);
   
        $updateStmt = $conn->prepare("UPDATE templates SET codigo = ?, Ultima_alter = NOW() WHERE nome_arquivo = ?");
        $updateStmt->bind_param("ss", $codigoAtualizado, $nome_arquivo);
        if ($updateStmt->execute()) {
            moveTempImages($template_id);
            echo json_encode([
                "success" => 1, 
                "message" => "Template atualizado com sucesso!",
                "template_id" => $template_id
            ]);
        } else {
            echo json_encode(["success" => 0, "message" => "Erro ao atualizar o template: " . $updateStmt->error]);
        }
        $updateStmt->close();
    } else {
        $idAntigo = $dados['id'];
        $insertStmt = $conn->prepare("INSERT INTO templates (nome_arquivo, codigo) VALUES (?, ?)");
        $insertStmt->bind_param("ss", $nome_arquivo, $codigo);
        $insertStmt->execute();
        $template_id = $conn->insert_id;
        $insertStmt->close();
        if ($idAntigo){
            $codigoAtualizado = str_replace(
                array("uploads\/temp\/", "uploads\/" . $idAntigo . "\/"),
                "uploads\/" . $template_id . "\/",
                $codigo
            );
            copyUsedTemplateImages($idAntigo, $template_id, $codigo);
        } else {
            $codigoAtualizado = str_replace("uploads\/temp\/", "uploads\/" . $template_id . "\/", $codigo);
        }
        $updateStmt = $conn->prepare("UPDATE templates SET codigo = ? WHERE id = ?");
        $updateStmt->bind_param("si", $codigoAtualizado, $template_id);
        $updateStmt->execute();
        $updateStmt->close();

        moveTempImages($template_id);
        echo json_encode([
            "success" => 1, 
            "message" => "Template criado com sucesso!",
            "template_id" => $template_id
        ]);
    }
}
$conn->close();
?>
