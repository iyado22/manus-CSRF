<?php 
header("Content-Type: application/json");
include(__DIR__."/../../includes/conf.php");
date_default_timezone_set('Asia/Jerusalem');

// Step 1: Validate user session
$admin_staff_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;
$role = $_POST['role'] ?? $_SESSION['role'] ?? null;

if (!$admin_staff_id || !$role) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing user ID or role"
    ]);
    exit;
}

// Step 2: Role restriction (must be either 'admin' or 'staff')
if ($role !== 'admin' && $role !== 'staff') {
    echo json_encode([
        "status" => "error",
        "message" => "Access denied: Role must be admin or staff"
    ]);
    exit;
}

// Step 3: Validate user identity from users table
$sql = "SELECT id FROM users WHERE id = ? AND role = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $admin_staff_id, $role);
if(!$stmt->execute()){
    echo json_encode([
        "status" => "error",
        "message" => "Failed to validate session identity (SQL error)"
    ]);
    exit;
}
$result = $stmt->get_result();
if($result->num_rows === 0){
    echo json_encode([
        "status" => "error",
        "message" => "No user found with matching ID and role"
    ]);
    exit;
}

// Step 4: Determine target staff_id and period
$staff_id = $_POST['staff_id'] ?? $admin_staff_id;
$period = $_POST['period'] ?? null;

if (!$period) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing period value (day/week/month/all)"
    ]);
    exit;
}

// Step 5: Confirm staff_id is valid and belongs to a staff user
$sql = "SELECT id FROM users WHERE id = ? AND role = 'staff'";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $staff_id);
if(!$stmt->execute()){
    echo json_encode([
        "status" => "error",
        "message" => "Failed to validate staff ID (SQL error)"
    ]);
    exit;
}
$result = $stmt->get_result();
if($result->num_rows === 0){
    echo json_encode([
        "status" => "error",
        "message" => "Invalid staff ID or user is not a staff member"
    ]);
    exit;
}

// Step 6: Calculate worked hours
$conditions = "staff_id = ?";
$params = [$staff_id];
$type = "i";

switch ($period){
    case 'day':
        $conditions .= " AND DATE(check_in) = CURDATE()";
        break;
    case 'week': 
        $conditions .= " AND WEEK(check_in) = WEEK(CURDATE()) AND YEAR(check_in) = YEAR(CURDATE())";
        break;
    case 'month':
        $conditions .= " AND MONTH(check_in) = MONTH(CURDATE()) AND YEAR(check_in) = YEAR(CURDATE())";
        break;
    case 'all':
        default:
        break;
}

$sql = "SELECT SUM(duration_minutes) AS total_minutes FROM work_log WHERE $conditions";
$stmt = $conn->prepare($sql);
$stmt->bind_param($type, ...$params);
if(!$stmt->execute()){
    echo json_encode([
        "status" => "error",
        "message" => "Failed to calculate worked hours (SQL error)"
    ]);
    exit;
}
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$total_minutes = $row['total_minutes'] ?? 0;
$worked_hours = $total_minutes / 60;

// Step 7: Get salary per hour
$sql = "SELECT salary_per_hour FROM staff_details WHERE staff_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $staff_id);
if(!$stmt->execute()){
    echo json_encode([
        "status" => "error",
        "message" => "Failed to retrieve salary_per_hour (SQL error)"
    ]);
    exit;
}
$salary_result = $stmt->get_result();
$row = $salary_result->fetch_assoc();
$salary_per_hour = $row['salary_per_hour'] ?? 0;

// Step 8: Final calculation
$salary = round($salary_per_hour * $worked_hours, 2);

echo json_encode([
    "status" => "success",
    "staff_id" => $staff_id,
    "period" => $period,
    "hours_worked" => $worked_hours,
    "salary_per_hour" => $salary_per_hour,
    "calculated_salary" => $salary
]);

?>
