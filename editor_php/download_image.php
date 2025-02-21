<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['imagens']) || !is_array($input['imagens'])) {
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Nenhuma lista de imagens foi enviada."
        ]);
        exit;
    }

    $imagens = $input['imagens'];
    $imagensNaoEncontradas = [];

    foreach ($imagens as $imageUrl) {
        $parsedPath = parse_url($imageUrl, PHP_URL_PATH);

        $filename = basename($parsedPath);
        $filename = urldecode($filename);

        $filePath = 'uploads/' . $filename;

        if (!file_exists($filePath)) {
            $imagensNaoEncontradas[] = $filename;
        }
    }

    if (empty($imagensNaoEncontradas)) {
        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Todas as imagens foram encontradas."
        ]);
    } else {
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Algumas imagens não foram encontradas.",
            "naoEncontradas" => $imagensNaoEncontradas
        ]);
    }
} else {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Método inválido. Use POST."
    ]);
}
