<?php

header("Content-Type: application/json; charset=UTF-8");
include (__DIR__ . '/../../includes/conf.php');
include(__DIR__ . '/../../includes/CsrfHelper.php');
CsrfHelper::validateToken();


$admin_id = $_SESSION['user_id'] ?? $_POST['user_id'] ??  null;
$role = $_SESSION['role'] ?? $_POST['role'] ??  null;

if (!$admin_id || $role !== 'admin') {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$sql = "SELECT full_name, email, phone, dob FROM users WHERE id = ? AND role = 'admin'";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $admin_id);

if (!$stmt->execute()) {
    echo json_encode(["status" => "error", "message" => "SQL error while retrieving admin profile"]);
    exit;
}

$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Admin not found"]);
    exit;
}

$admin = $result->fetch_assoc();
$stmt->close();

echo json_encode([
    "status" => "success",
    "message" => "Admin profile retrieved successfully",
    "data" => $admin
]);

$conn->close();
?>
