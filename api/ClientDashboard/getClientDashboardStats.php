<?php
header("Content-Type: application/json");
include(__DIR__ . '/../../includes/conf.php');
include(__DIR__ . '/../../includes/CsrfHelper.php');
CsrfHelper::validateToken();

$user_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;
$role = $_POST['role'] ?? $_SESSION['role'] ?? null;

if (!$user_id || $role !== 'client') {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

// Total appointments
$stmt1 = $conn->prepare("SELECT COUNT(*) FROM appointments WHERE client_id = ?");
$stmt1->bind_param("i", $user_id);
$stmt1->execute();
$stmt1->bind_result($totalAppointments);
$stmt1->fetch();
$stmt1->close();

// Upcoming appointments
$stmt2 = $conn->prepare("SELECT COUNT(*) FROM appointments WHERE client_id = ? AND status IN ('pending', 'confirmed') AND date >= CURDATE()");
$stmt2->bind_param("i", $user_id);
$stmt2->execute();
$stmt2->bind_result($upcomingAppointments);
$stmt2->fetch();
$stmt2->close();

// Completed appointments
$stmt3 = $conn->prepare("SELECT COUNT(*) FROM appointments WHERE client_id = ? AND status = 'completed'");
$stmt3->bind_param("i", $user_id);
$stmt3->execute();
$stmt3->bind_result($completedAppointments);
$stmt3->fetch();
$stmt3->close();

$conn->close();

echo json_encode([
    "status" => "success",
    "data" => [
        "totalAppointments" => $totalAppointments,
        "upcomingAppointments" => $upcomingAppointments,
        "completedAppointments" => $completedAppointments
    ]
]);
