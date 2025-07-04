<?php 
header("Content-Type: application/json");
include(__DIR__ . "/../../includes/conf.php");
include(__DIR__ . "/../../includes/CsrfHelper.php"); // CSRF protection
include(__DIR__ . "/../../includes/NotificationHelper.php"); // Notification support

CsrfHelper::validateToken();

date_default_timezone_set('Asia/Jerusalem');

$admin_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;
$role = $_POST['role'] ?? $_SESSION['role'] ?? null;

if ($role !== 'admin' || !$admin_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized access"
    ]);
    exit;
}

$sql = "SELECT id FROM users WHERE id = ? AND role = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $admin_id, $role);
if (!$stmt->execute()) {
    echo json_encode([
        "status" => "error",
        "message" => "SQL execution error (user check)."
    ]);
    exit;
}
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Admin not found or invalid role."
    ]);
    exit;
}

$appointment_id = $_POST['appointment_id'] ?? null;
$staff_id = $_POST['staff_id'] ?? null;
if (!$appointment_id || !$staff_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing required fields."
    ]);
    exit;
}

$sql = "SELECT id FROM users WHERE id = ? AND role = 'staff'";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $staff_id);
if (!$stmt->execute()) {
    echo json_encode([
        "status" => "error",
        "message" => "SQL execution error (staff check)."
    ]);
    exit;
}
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "This staff doesn't exist."
    ]);
    exit;
}



$sql = "SELECT date, time FROM appointments WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $appointment_id);
if (!$stmt->execute()) {
    echo json_encode([
        "status" => "error",
        "message" => "SQL execution error (appointment fetch)."
    ]);
    exit;
}
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Appointment not found."
    ]);
    exit;
}
$appointment = $result->fetch_assoc();
$stmt->close();
$appointment_date = $appointment['date'];
$appointment_time = $appointment['time'];

// Verify appointment exists and not completed
$sql = "SELECT client_id, service_id FROM appointments WHERE id = ? AND status != 'completed' AND date = ? AND time = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iss", $appointment_id, $appointment_date, $appointment_time);
if (!$stmt->execute()) {
    echo json_encode([
        "status" => "error",
        "message" => "SQL execution error (appointment check)."
    ]);
    exit;
}
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Appointment doesn't exist or is already completed."
    ]);
    exit;
}
$appointment = $result->fetch_assoc();
$stmt->close();

$client_id = $appointment['client_id'];
$service_id = $appointment['service_id'];

// Verify staff exists
$sql = "SELECT full_name FROM users WHERE id = ? AND role = 'staff'";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $staff_id);
if (!$stmt->execute()) {
    echo json_encode([
        "status" => "error",
        "message" => "SQL execution error (staff check)."
    ]);
    exit;
}
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "This staff doesn't exist."
    ]);
    exit;
}
$staff = $result->fetch_assoc();
$stmt->close();

// Check if the staff is already booked at this date and time
$sql = "SELECT id FROM appointments WHERE staff_id = ? AND date = ? AND time = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iss", $staff_id, $appointment_date, $appointment_time);
if (!$stmt->execute()) {
    echo json_encode([
        "status" => "error",
        "message" => "SQL execution error (staff conflict check)."
    ]);
    exit;
}
$result = $stmt->get_result();
if ($result->num_rows > 0) {
    echo json_encode([
        "status" => "error",
        "message" => "This staff is already booked at that specific time."
    ]);
    exit;
}
$stmt->close();

// Update the appointment
$sql = "UPDATE appointments SET staff_id = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $staff_id, $appointment_id);
if (!$stmt->execute()) {
    echo json_encode([
        "status" => "error",
        "message" => "SQL execution error (update)."
    ]);
    exit;
}

$data= ["staff_name" => $staff['full_name'],
    "date" => $appointment_date,
    "time" => $appointment_time,
    "service_id" => $service_id,
    "client_id" => $client_id,
    "appointment_id" => $appointment_id];

// Notify the staff member
NotificationHelper::sendStaffAssignmentNotification($staff_id, $data);

echo json_encode([
    "status" => "success!",
    "message" => "Staff assigned successfully!"
]);

$stmt->close();
$conn->close();
