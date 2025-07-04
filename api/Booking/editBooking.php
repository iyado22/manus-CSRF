<?php 
header("Content-Type: application/json");

include(__DIR__ . '/../../includes/conf.php');
include(__DIR__ . '/../../includes/CsrfHelper.php'); 
include(__DIR__ . '/../../includes/NotificationHelper.php'); 
CsrfHelper::validateToken();

if($_SERVER['REQUEST_METHOD'] === 'POST')
{
    $client_id = $_POST['user_id'] ?? $_SESSION['user_id']  ?? null;
    $role = $_POST['role'] ?? $_SESSION['role'] ?? null;
    if(!$client_id || !$role){
        echo json_encode(["status" => "error", "message" => "Missing user ID or role"]);
        exit;
    }

    $sql = "SELECT * FROM users WHERE id = ? AND role = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("is", $client_id, $role);
    if(!$stmt->execute()) {
        echo json_encode(["status" => "error", "message" => "SQL error while retrieving user info"]);
        exit;
    }
    $result = $stmt->get_result();
    if($result->num_rows === 0) {
        echo json_encode(["status" => "error", "message" => "User not found or unauthorized"]);
        exit;
    }

    // Get and validate appointment ID
    $appointment_id = $_POST['appointment_id'] ?? null;
    if(!$appointment_id){
        echo json_encode(["status" => "error", "message" => "Missing appointment ID"]);
        exit;
    }

    // Fetch client name
    $stmt = $conn->prepare("SELECT full_name FROM users WHERE id = ? AND role = 'client'");
    $stmt->bind_param("i", $client_id);
    if(!$stmt->execute()) {
        echo json_encode(["status" => "error", "message" => "SQL error while retrieving client info"]);
        exit;
    }
    $result = $stmt->get_result();
    if($result->num_rows === 0) {
        echo json_encode(["status" => "error", "message" => "Client not found"]);
        exit;
    }
    $row = $result->fetch_assoc();
    $client_name = $row['full_name'];
    $stmt->close();

    // Fetch current appointment details
    $stmt = $conn->prepare("SELECT service_id, date, time FROM appointments WHERE id = ? AND client_id = ?");
    $stmt->bind_param("ii", $appointment_id, $client_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if($result->num_rows === 0){
        echo json_encode(["status" => "error", "message" => "Appointment not found"]);
        exit;
    }
    $current = $result->fetch_assoc();
    $service_id = $_POST['service_id'] ?? $current['service_id'];
    $date = $_POST['date'] ?? $current['date'];
    $time = $_POST['time'] ?? $current['time'];
    $stmt->close();

    // Check if the new date is in the past
    $date_today = date('Y-m-d');
    if($date < $date_today){
        echo json_encode(["status" => "error", "message" => "This date has passed"]);
        exit;
    }

    // Check if the time slot is already taken (by other appointments)
    $stmt = $conn->prepare("SELECT * FROM appointments WHERE date = ? AND time = ? AND id != ?");
    $stmt->bind_param("ssi", $date, $time, $appointment_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if($result->num_rows > 0){
        echo json_encode(["status" => "error", "message" => "This time is already reserved"]);
        exit;
    }
    $stmt->close();

    // Fetch the service name and current date/time
    $stmt = $conn->prepare("
        SELECT s.name AS service_name, a.date AS old_date, a.time AS old_time
        FROM appointments a
        JOIN services s ON a.service_id = s.id
        WHERE a.id = ?
    ");
    $stmt->bind_param("i", $appointment_id);
    $stmt->execute();
    $stmt->bind_result($service_name, $old_date, $old_time);
    $stmt->fetch();
    $stmt->close();

    // Update appointment
    $stmt = $conn->prepare("UPDATE appointments SET service_id = ?, date = ?, time = ? WHERE id = ?");
    $stmt->bind_param("issi", $service_id, $date, $time, $appointment_id);
    if(!$stmt->execute()){
        echo json_encode(["status" => "error", "message" => "DB error: Appointment update failed"]);
        exit;
    }

    // Send notifications
    $bookingData = [
        'service_name' => $service_name,
        'old_date' => $old_date,
        'old_time' => $old_time,
        'new_date' => $date,
        'new_time' => $time,
        'status' => 'updated'
    ];

    NotificationHelper::sendBookingNotification($client_id, $bookingData);
    NotificationHelper::notifyAdmins("Appointment Updated", "Client $client_name updated their appointment for $service_name from $old_date at $old_time to $date at $time.");

    echo json_encode(["status" => "success", "message" => "Appointment updated successfully!"]);
}
else
{
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}
$conn->close();
?>

