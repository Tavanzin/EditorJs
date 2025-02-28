<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (isset($_FILES["image"])) {

        $uploadDir = "uploads/temp/";
        $fileName = basename($_FILES["image"]["name"]);
        $targetFile = $uploadDir . $fileName;

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $fileType = strtolower(pathinfo($targetFile, PATHINFO_EXTENSION));
        $allowedTypes = ["jpg", "jpeg", "png", "gif"];
 
        if (!in_array($fileType, $allowedTypes)) {
            echo json_encode(["success" => 0, "message" => "Formato inválido."]);
            exit;
        }

        foreach (glob($uploadDir . "*.*") as $existingFile) {
            if (basename($existingFile) === basename($_FILES["image"]["name"])) {
                echo json_encode([
                    "success" => 1,
                    "file" => ["url" => "http://" . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . "/" . $existingFile]
                ]);
                exit;
            }
        }

        if (file_exists($targetFile)) {
            echo json_encode([
                "success" => 1,
                "file" => ["url" => $fileUrl]
            ]);
            exit;
        }
        
        if (move_uploaded_file($_FILES["image"]["tmp_name"], $targetFile)) {

            echo json_encode([
                "success" => 1,
                "file" => ["url" => "http://" . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . "/" . $targetFile],
                "image" => $fileName
            ]);
        } else {
            echo json_encode(["success" => 0, "message" => "Erro ao salvar o arquivo."]);
        }
    } else {
        echo json_encode(["success" => 0, "message" => "Nenhum arquivo enviado."]);
    }
} else {
    echo json_encode(["success" => 0, "message" => "Método inválido."]);
}