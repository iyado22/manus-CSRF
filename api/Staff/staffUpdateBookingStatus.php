<?php 
header("Content-Type: application/json");
include(__DIR__ . '/../../includes/conf.php');
include(__DIR__ . '/../../includes/CsrfHelper.php'); //Includes the CSRF helper to validate the CSRF token.
include(__DIR__ . '/../../includes/NotificationHelper.php'); //Includes the Notification helper to send notifications to the user.

CsrfHelper::validateToken(); //Validates the CSRF token to prevent CSRF attacks. (Cross-Site Request Forgery)

$staff_admin_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;
$role = $_POST['role'] ?? $_SESSION['role'] ?? null;
$appointment_id = $_POST['appointment_id'] ?? null;
$newStatus = $_POST['status'];

if ($staff_admin_id && $appointment_id && ($role === 'admin' || $role === 'staff')) {
    $sql = "UPDATE appointments SET status = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $newStatus ,$appointment_id);

    if (!$stmt->execute()) {
        echo json_encode([
            "status" => "error",
            "message" => "SQL statement execution error"
        ]);
        exit;
    }

    if ($stmt->affected_rows === 0) {
        echo json_encode([
            "status" => "error",
            "message" => "No booking updated — check ID or status"
        ]);
        exit;
    }

    $stmt = $conn->prepare("
    SELECT s.name AS service_name, a.date, a.time, a.status, a.client_id
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    WHERE a.id = ?
    ");
    $stmt->bind_param('i', $appointment_id);
    $stmt->execute();
    $stmt->bind_result($service_name, $date, $time, $status, $client_id);
    $stmt->fetch();
    

    $bookingData = [
        'service_name' => $service_name,
        'date' => $date,
        'time' => $time,
        'status' => $status
    ];  

    $stmt->close();
    NotificationHelper::sendBookingNotification($client_id, $bookingData);

    

    echo json_encode([
        "status" => "success",
        "message" => "Booking status updated successfully!"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Staff/Admin identification or booking ID missing"
    ]);
}
?>
