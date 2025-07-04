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

// 1. Total bookings
$bookings = $conn->prepare("SELECT COUNT(*) FROM appointments WHERE client_id = ?");
$bookings->bind_param("i", $user_id);
$bookings->execute();
$bookings->bind_result($totalBookings);
$bookings->fetch();
$bookings->close();

// 2. Completed services
$completed = $conn->prepare("SELECT COUNT(*) FROM appointments WHERE client_id = ? AND status = 'completed'");
$completed->bind_param("i", $user_id);
$completed->execute();
$completed->bind_result($completedServices);
$completed->fetch();
$completed->close();



echo json_encode([
    "status" => "success",
    "data" => [
        "totalBookings" => $totalBookings,
        "completedServices" => $completedServices,
    ]
]);
$conn->close();
?>
