<?php
header("Content-Type: application/json; charset=UTF-8");
include (__DIR__ . '/../../includes/conf.php');

$staff_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;
$role = $_POST['role'] ?? $_SESSION['role'] ?? null;

if (!$staff_id || $role !== 'staff') {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$sql = "
SELECT 
    u.full_name, u.email, u.phone, u.dob,
    sd.salary_per_hour, sd.notes, sd.date_registered
FROM users u
LEFT JOIN staff_details sd ON u.id = sd.staff_id
WHERE u.id = ? AND u.role = 'staff'
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $staff_id);

if (!$stmt->execute()) {
    echo json_encode(["status" => "error", "message" => "SQL error while retrieving staff profile"]);
    exit;
}

$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Staff not found"]);
    exit;
}

$staff = $result->fetch_assoc();
$stmt->close();

echo json_encode([
    "status" => "success",
    "message" => "Staff profile retrieved successfully",
    "data" => $staff
]);

$conn->close();
?>
