<?php
die; // nao esta sendo usado pq o image tool nao esta funcionando
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $uploadDirectory = 'uploads/';

    if (!is_dir($uploadDirectory)) {
        mkdir($uploadDirectory, 0755, true);
    }

    $file = $_FILES['file'];
    $fileName = basename($file['name']);
    $fileTmpPath = $file['tmp_name'];
    $fileSize = $file['size'];
    $fileError = $file['error'];
    
    ob_start();
    var_dump($file);
    $varDumpOutput = ob_get_clean();

    if ($fileError === UPLOAD_ERR_OK) {
        $fileDestination = $uploadDirectory . $fileName;
        var_dump($fileDestination);

        if (move_uploaded_file($fileTmpPath, $fileDestination)) {
            echo json_encode([
                'success' => true,
                'file' => [
                    'url' => 'http://' . $_SERVER['HTTP_HOST'] . '/' . $fileDestination
                ],
                'var_dump' => $varDumpOutput
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao mover o arquivo para o diretório de uploads.'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Erro no upload do arquivo.'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Nenhum arquivo enviado.'
    ]);
}
?>
