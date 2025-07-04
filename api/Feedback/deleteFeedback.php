<?php 
header("Content-Type: application/json");
include(__DIR__."/../../includes/conf.php");
include(__DIR__."/../../includes/CsrfHelper.php");




$admin_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;
$role = $_POST['role'] ?? $_SESSION['role'] ?? null;

if ($role !== 'admin' || !$admin_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized access"
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


$feedback_id = $_POST['feedback_id'] ?? null;
if (!isset($feedback_id) || !is_numeric($feedback_id)) {  // ✅ Added is_numeric check
    echo json_encode([
        "status" => "error",
        "message" => "Missing or invalid feedback ID."
    ]);
    exit;
}

$sql = "SELECT * FROM feedback WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $feedback_id);
if(!$stmt->execute()){
    echo json_encode
    (
        [
            "status" => "error",
            "message" => "SQL execution error."
        ]
        );
        exit;
}
$result = $stmt->get_result();
if($result->num_rows === 0){
    echo json_encode
    (
        [
            "status" => "error",
            "message" => "Feedback doesn't exist."
        ]
        );
        exit;
}

$sql = "DELETE FROM feedback WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $feedback_id);
if(!$stmt->execute()){
    echo json_encode
    (
        [
            "status" => "error",
            "message" => "SQL execution error."
        ]
        );
        exit;
}
else{
    echo json_encode
    (
        [
            "status" => "success!",
            "message" => "Feedback deleted successfully!"
        ]
        );
}

$stmt->close();
$conn->close();
?>