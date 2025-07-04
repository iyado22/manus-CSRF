<?php
include_once __DIR__."/../../includes/conf.php";
include_once __DIR__."/../../includes/CsrfHelper.php";
header('Content-Type: application/json');


CsrfHelper::validateToken();

$user_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;

if (!$user_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized access"
    ]);
    exit;
}

$sql = "SELECT id FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $user_id);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "User not found"
    ]);
    exit;
}

$stmt = $conn->prepare("
    SELECT id, title, message, created_at, is_read
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 50
");
$stmt->bind_param('i', $user_id);
$stmt->execute();

$result = $stmt->get_result();

$notifications = [];
while ($row = $result->fetch_assoc()) {
    $notifications[] = $row;
}

echo json_encode([
    "status" => "success",
    "data" => $notifications
]);

$stmt->close();
$conn->close();
?>
