<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$servername="localhost";
$username="root";
$password="";
$dbname="editorjs";

$conn=new mysqli($servername,$username,$password,$dbname);
if($conn->connect_error){die("Falha na conexão: ".$conn->connect_error);}

if($_SERVER["REQUEST_METHOD"]=="POST"){
    $json=file_get_contents("php://input");
    $dados=json_decode($json,true);

    if(!isset($dados["codigo"])||!isset($dados["nome_arquivo"])){die("Erro: Dados inválidos recebidos.");}

    $codigo=json_encode($dados["codigo"],JSON_UNESCAPED_UNICODE);
    $nome_arquivo=preg_replace("/[^a-zA-Z0-9_-]/","",$dados["nome_arquivo"]);
    $stmt=$conn->prepare("SELECT * FROM templates WHERE nome_arquivo = ?");
    $stmt->bind_param("s",$nome_arquivo);
    $stmt->execute();
    $result=$stmt->get_result();

    if($result->num_rows>0){
        $row=$result->fetch_assoc();
        $template_id = $row['id'];
        $codigo_anterior = $row['codigo'];

        $stmt_versao=$conn->prepare("SELECT COALESCE(MAX(versao),'0') AS versao_atual FROM versao_templates WHERE template_id = ?");
        $stmt_versao->bind_param("i",$template_id);
        $stmt_versao->execute();

        $res_versao=$stmt_versao->get_result();

        $versao_atual=$res_versao->fetch_assoc()["versao_atual"];

        $stmt_versao->close();

        var_dump($versao_atual);
        
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

        $stmt_hist=$conn->prepare("INSERT INTO versao_templates (template_id, versao, codigo) VALUES (?, ?, ?)");
        $stmt_hist->bind_param("ids",$template_id,$nova_versao,$codigo_anterior);
        $stmt_hist->execute();

        $stmt_hist->close();

        $updateStmt=$conn->prepare("UPDATE templates SET codigo = ?, Ultima_alter = NOW() WHERE nome_arquivo = ?");
        $updateStmt->bind_param("ss",$codigo,$nome_arquivo);

        if($updateStmt->execute()){
            echo "Template atualizado com sucesso!";
        } else {
            echo "Erro ao atualizar o template: ".$updateStmt->error;
        }

        $updateStmt->close();

    } else {

        $insertStmt=$conn->prepare("INSERT INTO templates (nome_arquivo, codigo) VALUES (?, ?)");
        $insertStmt->bind_param("ss",$nome_arquivo,$codigo);
        $insertStmt->execute();

        $insertStmt->close();
    }
}
$conn->close();
?>
