<?php
header("Content-Type: application/json");
include(__DIR__ . '/../../includes/conf.php');


$email = $_POST['email'] ?? $_SESSION['email_to_verify'] ?? null;
if(!$email){
    echo json_encode([
        "status" => "error",
        "message" => "Session expired or email not set"
    ]);
    exit;
}

if($_SERVER['REQUEST_METHOD'] === 'POST'){
    $new_password = $_POST['new_password'];
    $confirm_password = $_POST['password_confirm'];
    if(!$new_password || !$confirm_password){
        echo json_encode([
            "status" => "error",
            "message" => "Please fill in all fields"
        ]);
        exit;
    }
    if($new_password !== $confirm_password){
         echo json_encode([
        "status" => "error",
        "message" => "Passwords do not match"
    ]);
    exit;   
    }
        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT); //'PASSWORD_DEFAULT' is a reference name to a hashing algorithm (bycript)
        $sql = "UPDATE users SET password = ? WHERE email = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $hashed_password, $email);
        if(!$stmt->execute()){
            echo json_encode([
        "status" => "error",
        "message" => "SQL execution error."
    ]);
    exit;
        }

        echo json_encode([
        "status" => "success!",
        "message" => "Password changed successfully!"
    ]);
    $stmt->close();
    $conn->close();
}

else{
    echo json_encode(
        [
            "status" => "error",
            "message" => "Invalid request method."
        ]
    );
}




?>