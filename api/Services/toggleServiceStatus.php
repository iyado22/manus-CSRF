<?php 
header("Content-Type: application/json");
include(__DIR__."/../../includes/conf.php");
include(__DIR__."/../../includes/CsrfHelper.php");
CsrfHelper::validateToken(); //Validates the CSRF token to prevent CSRF attacks. (Cross-Site Request Forgery)

$admin_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;
$role = $_POST['role'] ?? $_SESSION['role'] ?? null;

if ($role !== 'admin' || !$admin_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized access"
    ]);
    exit;
}

$service_id = $_POST['service_id'];
if(!$service_id){
    echo json_encode([
        "status" => "error",
        "message" => "Service ID missing."
    ]);
    exit;
}

$sql = "UPDATE services SET is_active = NOT is_active WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $service_id);
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
            "message" => "Service status changed successfully!"
        ]
        );
}

$stmt->close();
$conn->close();
?>