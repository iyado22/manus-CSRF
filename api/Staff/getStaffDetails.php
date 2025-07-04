<?php 
header("Content-Type: application/json");
include(__DIR__."/../../includes/conf.php");

// Auth check
$admin_id = $_SESSION['user_id'] ?? $_POST['user_id'] ??  null;
$role = $_SESSION['role'] ?? $_POST['role'] ?? null;

if (!$role || !$admin_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing required fields."
    ]);
    exit;
}

// Verify admin
$sql = "SELECT id FROM users WHERE id = ? AND role = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $admin_id, $role);
if (!$stmt->execute()) {
    echo json_encode([
        "status" => "error",
        "message" => "SQL execution error"
    ]);
    exit;
}
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized access"
    ]);
    exit;
}
$stmt->close();

// Pagination inputs
$page = isset($_POST['page']) ? intval($_POST['page']) : 1;
$limit = isset($_POST['limit']) ? intval($_POST['limit']) : 10;
$offset = ($page - 1) * $limit;

// Total count
$countSql = "SELECT COUNT(*) as total FROM users u JOIN staff_details sd ON u.id = sd.staff_id WHERE u.role = 'staff'";
$countResult = $conn->query($countSql);
$total = $countResult->fetch_assoc()['total'] ?? 0;

// Main query with pagination
$sql = "SELECT u.id AS staff_id, u.full_name, u.email, u.phone, u.dob, 
               sd.salary_per_hour, sd.notes, sd.date_registered
        FROM users u
        JOIN staff_details sd ON u.id = sd.staff_id
        WHERE u.role = 'staff'
        LIMIT ? OFFSET ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $limit, $offset);
$stmt->execute();
$result = $stmt->get_result();

$staff_list = [];
while($row = $result->fetch_assoc()) {
    $staff_list[] = $row;
}

echo json_encode([
    "status" => "success",
    "data" => $staff_list,
    "total" => $total
]);

$conn->close();
?>
