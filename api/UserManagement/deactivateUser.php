<?php 
header("Content-Type: application/json");
include(__DIR__."/../../includes/conf.php");
include(__DIR__."/../../includes/CsrfHelper.php");
// CsrfHelper::validateToken(); //Validates the CSRF token to prevent CSRF attacks. (Cross-Site Request Forgery)

$admin_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;
$role = $_POST['role'] ?? $_SESSION['role'] ?? null;

if ($role !== 'admin' || !$admin_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized access"
    ]);
    exit;
}

$target_user_id = $_POST['target_user_id'] ?? null;


$sql = "UPDATE users SET is_active = NOT is_active WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i",$target_user_id);
if(!$stmt->execute()){
    echo json_encode(
        [
            "status" => "error",
            "message" => "SQL execution error."
        ]
        );
        exit;
}
else{
    echo json_encode(
        [
            "status" => "success!",
            "message" => "Active status updated successfully!"
        ]
        );
        exit;
}
?>