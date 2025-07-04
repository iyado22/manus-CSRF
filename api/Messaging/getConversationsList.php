<?php
include_once __DIR__."/../../includes/conf.php";
include_once __DIR__."/../../includes/CsrfHelper.php";


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

/*
 Strategy:
 - We will find DISTINCT conversation pairs (sender_id + receiver_id)
 - For each conversation, show the latest message
 - ORDERED by latest message date DESC
*/

$stmt = $conn->prepare("
    SELECT m1.id, 
           CASE 
               WHEN m1.sender_id = ? THEN m1.receiver_id
               ELSE m1.sender_id
           END AS other_user_id,
           u.full_name AS other_user_name,
           m1.message,
           m1.sent_at,
           m1.is_read
    FROM messages m1
    JOIN users u ON u.id = CASE 
                               WHEN m1.sender_id = ? THEN m1.receiver_id
                               ELSE m1.sender_id
                           END
    WHERE m1.id IN (
        SELECT MAX(id) FROM messages
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id)
    )
    ORDER BY m1.sent_at DESC
");

$stmt->bind_param('iiii', $user_id, $user_id, $user_id, $user_id);
$stmt->execute();

$result = $stmt->get_result();

$conversations = [];
while ($row = $result->fetch_assoc()) {
    $conversations[] = $row;
}

echo json_encode([
    "status" => "success",
    "data" => $conversations
]);

$stmt->close();
$conn->close();
?>
