<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
include (__DIR__ . '/../../includes/conf.php');
include(__DIR__ . '/../../includes/CsrfHelper.php');
CsrfHelper::validateToken();

$client_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;
$role = $_POST['role'] ?? $_SESSION['role'] ?? null;
if (!$client_id || $role !== 'client') {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$sql = "SELECT full_name, email, phone, dob FROM users WHERE id = ? AND role = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $client_id, $role);
if (!$stmt->execute()) {
    echo json_encode(["status" => "error", "message" => "SQL error while retrieving client profile"]);
    exit;
}
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Client not found"]);
    exit;
}

$client = $result->fetch_assoc();
$stmt->close();

echo json_encode([
    "status" => "success",
    "message" => "Client profile retrieved successfully",
    "data" => [
        "full_name" => $client['full_name'],
        "email" => $client['email'],
        "phone" => $client['phone'],
        "dob" => $client['dob']
    ]
]);

$conn->close();


?>