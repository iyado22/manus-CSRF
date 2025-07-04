<?php
include_once __DIR__ . "/../../includes/conf.php";
include_once __DIR__ . "/../../includes/CsrfHelper.php";
header('Content-Type: application/json');


CsrfHelper::validateToken();

$user_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;
$message_id = $_POST['message_id'] ?? null;
$other_user_id = $_POST['other_user_id'] ?? null;  // NEW: to support batch marking

if (!$user_id || (!$message_id && !$other_user_id)) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing required parameters."
    ]);
    exit;
}

try {
    if ($message_id) {
        // ✅ Enhancement 1: check if message exists
        $stmt = $conn->prepare("SELECT receiver_id FROM messages WHERE id = ?");
        $stmt->bind_param('i', $message_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();

        if (!$row) {
            echo json_encode([
                "status" => "error",
                "message" => "Message not found."
            ]);
            exit;
        }

        if ($row['receiver_id'] != $user_id) {
            echo json_encode([
                "status" => "error",
                "message" => "Unauthorized."
            ]);
            exit;
        }

        // ✅ Mark that single message as read
        $stmt = $conn->prepare("UPDATE messages SET is_read = 1 WHERE id = ?");
        $stmt->bind_param('i', $message_id);
        $stmt->execute();

        echo json_encode([
            "status" => "success",
            "message" => "Message marked as read."
        ]);
    }

    // ✅ Enhancement 2: batch mark all messages from other_user_id
    elseif ($other_user_id) {
        $stmt = $conn->prepare("
            UPDATE messages 
            SET is_read = 1 
            WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
        ");
        $stmt->bind_param('ii', $other_user_id, $user_id);
        $stmt->execute();

        echo json_encode([
            "status" => "success",
            "message" => "All messages from this user marked as read."
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Unexpected server error."
    ]);
}

$conn->close();
?>
