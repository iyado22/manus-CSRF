<?php
header("Content-Type: application/json");
include(__DIR__ . '/../../includes/conf.php');


$client_id = $_SESSION['user_id'] ?? $_POST['user_id'] ?? null;
$role = $_SESSION['role'] ?? $_POST['role'] ?? null;

if (!$client_id || $role !== 'client') {
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized"
    ]);
    exit;
}

// Fetch only the latest 5 appointments by date and time (DESC)
$sql = "
SELECT 
    a.id AS appointment_id,
    s.name AS service_name, 
    staff.full_name as staff_name,
    s.price,
    a.date,
    a.time, 
    a.status
FROM appointments a
LEFT JOIN users staff ON a.staff_id = staff.id
LEFT JOIN services s ON a.service_id = s.id 
WHERE a.client_id = ?
ORDER BY a.date DESC, a.time DESC
LIMIT 5
";


$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $client_id);
if (!$stmt->execute()) {
    echo json_encode([
        "status" => "error",
        "message" => "Execution error"
    ]);
    exit;
}

$result = $stmt->get_result();
$appointments = [];
while ($row = $result->fetch_assoc()) {
    $appointments[] = $row;
}

echo json_encode([
    "status" => "success",
    "data" => $appointments
]);

$stmt->close();
$conn->close();
?>
