<?php
include_once __DIR__."/../../includes/conf.php";
include_once __DIR__."/../../includes/CsrfHelper.php";
header('Content-Type: application/json');


CsrfHelper::validateToken();

$user_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;
$other_user_id = $_POST['other_user_id'] ?? null;

if (!$user_id || !$other_user_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing required parameters."
    ]);
    exit;
}

$sql = "SELECT id FROM users WHERE id = ? OR id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('ii', $user_id, $other_user_id);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows < 2) {
    echo json_encode([
        "status" => "error",
        "message" => "One or both users not found."
    ]);
    exit;
}

$stmt = $conn->prepare("
    SELECT id, sender_id, receiver_id, message, sent_at, is_read
    FROM messages
    WHERE (sender_id = ? AND receiver_id = ?)
       OR (sender_id = ? AND receiver_id = ?)
    ORDER BY sent_at ASC
");

$stmt->bind_param('iiii', $user_id, $other_user_id, $other_user_id, $user_id);
$stmt->execute();

$result = $stmt->get_result();

$messages = [];
while ($row = $result->fetch_assoc()) {
    $messages[] = $row;
}

echo json_encode([
    "status" => "success",
    "data" => $messages
]);

$stmt->close();
$conn->close();
?>
