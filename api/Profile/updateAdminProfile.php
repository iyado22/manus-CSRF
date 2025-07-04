<?php
header("Content-Type: application/json");
include(__DIR__ . '/../../includes/conf.php');
include(__DIR__ . '/../../includes/CsrfHelper.php');
CsrfHelper::validateToken();

$admin_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;
$role = $_POST['role'] ?? $_SESSION['role'] ?? null;

if (!$admin_id || $role !== 'admin') {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$fields = [];
$params = [];
$types = '';

if (!empty($_POST['full_name'])) {
    $fields[] = "full_name = ?";
    $params[] = $_POST['full_name'];
    $types .= 's';
}
if (!empty($_POST['phone'])) {
    $fields[] = "phone = ?";
    $params[] = $_POST['phone'];
    $types .= 's';
}
if (!empty($_POST['dob'])) {
    $fields[] = "dob = ?";
    $params[] = $_POST['dob'];
    $types .= 's';
}

if (empty($fields)) {
    echo json_encode(["status" => "error", "message" => "No fields provided for update"]);
    exit;
}

$sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ? AND role = ?";
$params[] = $admin_id;
$params[] = $role;
$types .= 'is';

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Admin profile updated successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Profile update failed"]);
}

$stmt->close();
$conn->close();
?>
