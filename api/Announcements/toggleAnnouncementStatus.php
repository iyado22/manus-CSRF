<?php 
header("Content-Type: application/json");
include(__DIR__."/../../includes/conf.php");
include(__DIR__."/../../includes/CsrfHelper.php");

CsrfHelper::validateToken(); //Validates the CSRF token to prevent CSRF attacks. (Cross-Site Request Forgery)

try{
$admin_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;
$role = $_POST['role'] ?? $_SESSION['role'] ?? null;

if (!$role || !$admin_id) {
    throw new Exception("Unauthorized access.");
}

$sql = "SELECT * FROM users WHERE id = ? AND role = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $admin_id, $role);
if(!$stmt->execute()){
    throw new Exception("SQL execution error.");
}
$result = $stmt->get_result();
if($result->num_rows === 0){
    throw new Exception("Unauthorized access.");
}


$announcement_id = $_POST['announcement_id'];
if(empty($announcement_id)){
    throw new Exception("Missing announcement_id");
}

$sql = "SELECT * FROM announcements WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $announcement_id);
if(!$stmt->execute()){
    throw new Exception("SQL execution error.");
}

$result = $stmt->get_result();
if($result->num_rows === 0){
    throw new Exception("Announcement doesn't exist");
}

$sql = "UPDATE announcements SET is_active = NOT is_active WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $announcement_id);
if(!$stmt->execute()){
    throw new Exception("SQL execution error.");
}

echo json_encode(
    [
        "status" => "success!",
        "message" => "Announcement status has been changed successfully!"
    ]
);

$stmt->close();
$conn->close();
} catch (Exception $e){
    echo json_encode(
        [
            "status" => "error",
            "message" => $e->getMessage()
        ]
    );
}

?>
