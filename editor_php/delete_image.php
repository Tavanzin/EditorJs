<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['imageUrl'])) {
        echo json_encode(["success" => 0, "message" => "URL da imagem não fornecida."]);
        exit;
    }
    $imageUrl = $input['imageUrl'];
    $filename = parse_url($imageUrl, PHP_URL_PATH);
    $filename = basename($filename);
    $filename = urldecode($filename);
    $id = isset($input['id']) && !empty($input['id']) ? filter_var($input['id']) : null;
    if ($id) {
        $filepath = 'uploads/' . $id . '/' . $filename;
    } else {
        $filepath = 'uploads/temp/' . $filename;
    }
    if (!file_exists($filepath)) {
        echo json_encode(["success" => 0, "message" => "Arquivo não encontrado."]);
        exit;
    }
    if (unlink($filepath)) {
        echo json_encode(["success" => 1, "message" => "Imagem deletada."]);
    } else {
        echo json_encode(["success" => 0, "message" => "Erro ao deletar o arquivo."]);
    }
} else {
    echo json_encode(["success" => 0, "message" => "Método inválido."]);
}
