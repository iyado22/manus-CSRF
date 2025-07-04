<?php 
header("Content-Type: application/json");
include(__DIR__."/../../includes/conf.php");
include(__DIR__."/../../includes/CsrfHelper.php");
CsrfHelper::validateToken(); //Validates the CSRF token to prevent CSRF attacks. (Cross-Site Request Forgery)

$admin_id = $_SESSION['user_id'] ?? $_POST['user_id'] ??  null;
$role = $_SESSION['role'] ?? $_POST['role'] ?? null;

if (!$role || !$admin_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing required field"
    ]);
    exit;
}

$sql = "SELECT * FROM users WHERE id = ? AND role = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $admin_id, $role);
if(!$stmt->execute()){
    echo json_encode([
        "status" => "error",
        "message" => "SQL execution error."
    ]);
    exit;
}
$result = $stmt->get_result();
if($result->num_rows === 0){
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized access"
    ]);
    exit;
}


$message = $_POST['message'];
if(empty($message)){
    echo json_encode([
        "status" => "error",
        "message" => "Missing required field"
    ]);
    exit;
}


$sql = "INSERT INTO announcements (message, created_by, created_at) VALUES (?, ?, CURRENT_TIMESTAMP())";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $message, $admin_id);
if(!$stmt->execute()){
    echo json_encode(
        [
            "status" => "error",
            "message" => "SQL execution error."
        ]
        );
        exit;
}


echo json_encode(
    [
        "status" => "success!",
        "message" => "Announcement posted successfully!"
    ]
);


$stmt->close();
$conn->close();


?>