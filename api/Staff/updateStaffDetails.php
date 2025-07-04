<?php 
header("Content-Type: application/json");
include(__DIR__."/../../includes/conf.php");




$admin_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;
$role = $_POST['role'] ?? $_SESSION['role'] ?? null;

if (!$role || !$admin_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing required fields."
    ]);
    exit;
}

// Confirm admin identity
$sql = "SELECT id FROM users WHERE id = ? AND role = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $admin_id, $role);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized access"
    ]);
    exit;
}
$stmt->close();

// Handle incoming update
$staff_id = $_POST['staff_id'] ?? null;
if (!$staff_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing staff ID."
    ]);
    exit;
}

// Fetch existing values
$sql = "SELECT salary_per_hour, notes FROM staff_details WHERE staff_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $staff_id);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Staff member not found."
    ]);
    exit;
}
$current = $result->fetch_assoc();
$stmt->close();

// Use new values only if provided, otherwise fallback to current ones
$salary_per_hour = isset($_POST['salary_per_hour']) ? floatval($_POST['salary_per_hour']) : $current['salary_per_hour'];
$notes = isset($_POST['notes']) ? $_POST['notes'] : $current['notes'];
$full_name = isset($_POST['full_name']) ? $_POST['full_name'] : $current['full_name'];
$phone = isset($_POST['phone']) ? $_POST['phone'] : $current['phone'];
$dob = isset($_POST['dob']) ? $_POST['dob'] : $current['dob'];

// First update: staff_details
$sql1 = "UPDATE staff_details SET salary_per_hour = ?, notes = ? WHERE staff_id = ?";
$stmt1 = $conn->prepare($sql1);
$stmt1->bind_param("dsi", $salary_per_hour, $notes, $staff_id);
$success1 = $stmt1->execute();
$stmt1->close();

// Second update: users
$sql2 = "UPDATE users SET full_name = ?, phone = ?, dob = ? WHERE id = ?";
$stmt2 = $conn->prepare($sql2);
$stmt2->bind_param("sssi", $full_name, $phone, $dob, $staff_id);
$success2 = $stmt2->execute();
$stmt2->close();

// Final result
if ($success1 && $success2) {
    echo json_encode([
        "status" => "success",
        "message" => "Staff details updated successfully!"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Failed to update staff details."
    ]);
}

$conn->close();
?>
