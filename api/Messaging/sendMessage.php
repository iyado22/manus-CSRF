<?php
include_once __DIR__."/../../includes/conf.php";
include_once __DIR__."/../../includes/CsrfHelper.php";
include_once __DIR__."/../../includes/NotificationHelper.php";
header('Content-Type: application/json');


CsrfHelper::validateToken();

$sender_id = $_POST['sender_id'] ?? $_SESSION['sender_id'] ?? null;
$receiver_id = $_POST['receiver_id'] ?? null;
$message = trim($_POST['message'] ?? '');


if (!$sender_id || !$receiver_id || empty($message)) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing required fields."
    ]);
    exit;
}

if($sender_id === $receiver_id) {
    echo json_encode([
        "status" => "error",
        "message" => "You cannot send a message to yourself."
    ]);
    exit;
}

$sql = "SELECT full_name FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $sender_id);
$stmt->execute();
$stmt->bind_result($full_name);
$stmt->fetch();
$stmt->close();

$messageData = [
    'sender_id' => $sender_id,
    'receiver_id' => $receiver_id,
    'content' => $message,
    'sender_name' => $full_name
];

$stmt = $conn->prepare("INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)");
$stmt->bind_param('iis', $sender_id, $receiver_id, $message);

if ($stmt->execute()) {
    echo json_encode([
        "status" => "success",
        "message" => "Message sent.",
        "data" => $messageData
    ]);

    NotificationHelper::sendMessageNotification($receiver_id, $messageData);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Failed to send message."
    ]);
    exit;
}

$stmt->close();
$conn->close();
?>
