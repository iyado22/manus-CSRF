<?php 
header("Content-Type: application/json");
include(__DIR__ . '/../../includes/conf.php');  //Connects with the database.


$role = $_POST['role'] ?? $_SESSION['role']   ?? null;
$admin_staff_id = $_POST['user_id'] ?? $_SESSION['user_id'] ??  null;

if (!$role || !$admin_staff_id){
    echo json_encode(["status" => "error", "message" => "Role or staff ID is missing"]);
    exit;
} 

if($role !== 'staff' && $role !== 'admin') {
    echo json_encode(["status" => "error", "message" => "Unauthorized access"]);
    exit;
}

$sql = "SELECT id FROM users WHERE id = ? AND role = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $admin_staff_id, $role);
if (!$stmt->execute()) {
    echo json_encode(["status" => "error", "message" => "SQL statement execution error"]);
    exit;
}
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Staff not found or invalid role"]);
    exit;
}
$stmt->close();

     $page_num = isset($_GET['page']) && is_numeric($_GET['page']) ? intval($_GET['page']) : 1;  //This is ternary operator, it's syntax is: condition ? value_if_true : value_if_false
    $limit = 10;
    $offset = ($page_num - 1) * $limit;

    $staff_id = $_POST['staff_id'] ?? null;
    $dateFrom = $_POST['date_from'] ?? null;
    $dateTo = $_POST['date_to'] ?? null;
    $mode = $_POST['mode'] ?? null;

    error_log("DEBUG: mode = $mode");
error_log("DEBUG: date_from = $dateFrom");
error_log("DEBUG: date_to = $dateTo");  

    if (!$staff_id) {
    echo json_encode(["status" => "error", "message" => "Missing staff ID"]);
    exit;
}

    // SQL query to fetch appointments for the staff
    // Including client name, service name, date, time, and status
   $sql = "
SELECT 
    a.id AS appointment_id,
    u.full_name AS client_name,
    s.name AS service_name, 
    a.date, 
    a.time, 
    a.status,
    a.price
FROM appointments a
JOIN users u ON a.client_id = u.id
JOIN services s ON a.service_id = s.id
WHERE a.staff_id = ?
";

$params = [$staff_id];
$types = "i";

// Add filters
if ($mode === 'today') {
    $sql .= " AND a.date = CURDATE()";
} elseif ($dateFrom && $dateTo) {
    $sql .= " AND a.date BETWEEN ? AND ?";
    $params[] = $dateFrom;
    $params[] = $dateTo;
    $types .= "ss";
}

// Finalize
$sql .= " ORDER BY a.date, a.time";



// Prepare, bind and execute
$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if (!$stmt->execute()) {
    echo json_encode(["status" => "error", "message" => "SQL statement execution error"]);
    exit;
}

$result = $stmt->get_result();
$appointments = [];

while ($row = $result->fetch_assoc()) {
    $appointments[] = $row;
}

echo json_encode([
    "status" => "success",
    "debug" => [
        "date_from" => $dateFrom,
        "date_to" => $dateTo,
        "mode" => $mode
    ],
    "data" => $appointments
]);


$stmt->close();



$conn->close();
?>
