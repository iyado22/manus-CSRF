<?php
include_once __DIR__."/../../includes/conf.php";
include_once __DIR__."/../../includes/CsrfHelper.php";
header('Content-Type: application/json');


CsrfHelper::validateToken();

$user_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;
$notification_id = $_POST['notification_id'] ?? null;

if (!$user_id || !$notification_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing required parameters."
    ]);
    exit;
}

// Validate user exists
$stmt = $conn->prepare("SELECT id FROM users WHERE id = ?");
$stmt->bind_param('i', $user_id);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "User not found."
    ]);
    exit;
}
$stmt->close();

// Validate notification exists
$stmt = $conn->prepare("SELECT id FROM notifications WHERE id = ? AND user_id = ?");
$stmt->bind_param('ii', $notification_id, $user_id);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Notification not found or does not belong to this user."
    ]);
    exit;
}


// Ensure this notification belongs to this user
$stmt = $conn->prepare("SELECT user_id FROM notifications WHERE id = ?");
$stmt->bind_param('i', $notification_id);
$stmt->execute();
$stmt->bind_result($notification_user_id);
$stmt->fetch();
$stmt->close();


if ($notification_user_id != $user_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized action."
    ]);
    exit;
}

// Mark as read
$stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE id = ?");
$stmt->bind_param('i', $notification_id);
if ($stmt->execute()) {
    echo json_encode([
        "status" => "success",
        "message" => "Notification marked as read."
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Failed to mark as read."
    ]);
}

$stmt->close();
$conn->close();
?>
