<?php
header("Content-Type: application/json");
include(__DIR__ . '/../../includes/conf.php');

// Get client_id and role from session or POST
$client_id = $_SESSION['user_id'] ?? $_POST['user_id'] ?? null;
$role = $_SESSION['role'] ?? $_POST['role'] ?? null;

$debugPath = __DIR__ . '/../../../debug_feedback.log';
$result = file_put_contents($debugPath, "ID: $client_id\nROLE: $role\nPOST: " . print_r($_POST, true));

if ($result === false) {
    echo json_encode([
        "status" => "error",
        "message" => "Failed to write debug log to: $debugPath"
    ]);
    exit;
}



// Debug log (optional)
// file_put_contents("debug.log", "ID: $client_id\nROLE: $role\nPOST: " . print_r($_POST, true));

if (!$client_id || strtolower(trim($role)) !== 'client') {
    echo json_encode([
        "status" => "error",
        "message" => "User not found or not a client"
    ]);
    exit;
}

// Check user exists and active
$sql = "SELECT id FROM users WHERE id = ? AND role = 'client' AND is_active = 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $client_id);
$stmt->execute();
$stmt->bind_result($id);
$result = $stmt->fetch();
$stmt->close();

if (!$result || !$id) {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid client"
    ]);
    exit;
}

// Pagination (optional for large lists)
$page_num = isset($_POST['page']) && is_numeric($_POST['page']) ? intval($_POST['page']) : 1;
$limit = 10;
$offset = ($page_num - 1) * $limit;


// Count total completed appointments
$countSql = "SELECT COUNT(*) AS total FROM appointments WHERE client_id = ? AND status = 'completed'";
$countStmt = $conn->prepare($countSql);
$countStmt->bind_param("i", $client_id);
$countStmt->execute();
$countResult = $countStmt->get_result();
$totalAppointments = $countResult->fetch_assoc()['total'];
$countStmt->close();

// Fetch completed appointments with feedback check
$sql = "
    SELECT 
        a.id AS appointment_id,
        s.name AS service_name,
        staff.full_name AS staff_name,
        s.price,
        a.date,
        a.time,
        a.status,
        IF(f.id IS NULL, 0, 1) AS has_feedback
    FROM appointments a
    LEFT JOIN users staff ON a.staff_id = staff.id
    JOIN services s ON a.service_id = s.id
    LEFT JOIN feedback f ON f.booking_id = a.id
    WHERE a.client_id = ? AND a.status = 'completed'
    ORDER BY a.date DESC, a.time DESC
    LIMIT ? OFFSET ?
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("iii", $client_id, $limit, $offset);
$stmt->execute();
$result = $stmt->get_result();

$appointments = [];
while ($row = $result->fetch_assoc()) {
    $appointments[] = $row;
}

echo json_encode([
    "status" => "success",
    "data" => [
        "appointments" => $appointments,
        "total" => $totalAppointments,
        "page" => $page_num
    ]
]);

$stmt->close();
$conn->close();
?>
