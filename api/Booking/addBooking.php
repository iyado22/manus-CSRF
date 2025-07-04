<?php 

include(__DIR__ . '/../../includes/conf.php');
include(__DIR__ . '/../../includes/CsrfHelper.php');
include(__DIR__ . '/../../includes/NotificationHelper.php');
header("Content-Type: application/json");

CsrfHelper::validateToken();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $client_id = $_SESSION['user_id'] ?? $_POST['user_id'] ??  null;
    $role = $_SESSION['role'] ?? $_POST['role'] ?? null;

    if (!$client_id || $role !== 'client') {
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit;
    }

    $service_id = $_POST['service_id'] ?? null;
    $date = $_POST['date'] ?? null;
    $time = $_POST['time'] ?? null;
    $notes = $_POST['notes'] ?? '';

    if (!$service_id || !$date || !$time) {
        echo json_encode(["status" => "error", "message" => "Missing booking fields"]);
        exit;
    }

    // 🕓 Check date validity
    if ($date < date('Y-m-d')) {
        echo json_encode(["status" => "error", "message" => "Cannot book past date"]);
        exit;
    }

    // ❌ Check if time already booked
    $stmt = $conn->prepare("SELECT id FROM appointments WHERE service_id = ? AND date = ? AND time = ?");
    $stmt->bind_param("iss", $service_id, $date, $time);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "Time already booked"]);
        exit;
    }
    $stmt->close();

    // ✅ Get service info
    $stmt = $conn->prepare("SELECT price, name FROM services WHERE id = ?");
    $stmt->bind_param("i", $service_id);
    $stmt->execute();
    $service = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$service) {
        echo json_encode(["status" => "error", "message" => "Service not found"]);
        exit;
    }

    $price = $service['price'];
    $service_name = $service['name'];

    // ✅ Get client name
    $stmt = $conn->prepare("SELECT full_name FROM users WHERE id = ?");
    $stmt->bind_param("i", $client_id);
    $stmt->execute();
    $client = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    $client_name = $client['full_name'] ?? 'Unknown';

    error_log("Booking Insert: client=$client_id, service=$service_id, date=$date, time=$time, price=$price, notes=$notes");

    // ✅ Insert appointment (no staff)
    $stmt = $conn->prepare("INSERT INTO appointments (client_id, service_id, date, time, price, health_contraindications) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("iissds", $client_id, $service_id, $date, $time, $price, $notes);
    $success = $stmt->execute();
    $stmt->close();

    if (!$success) {
        echo json_encode(["status" => "error", "message" => "Booking failed"]);
        exit;
    }

    // 🔔 Send notification
    $bookingData = [
        'client_name' => $client_name,
        'client_id' => $client_id,
        'service_name' => $service_name,
        'date' => $date,
        'time' => $time,
        'price' => $price,
        'status' => 'pending'
    ];

    NotificationHelper::sendBookingNotification($client_id, $bookingData);
    NotificationHelper::notifyAdmins("New Booking", "A new booking by $client_name for $service_name on $date at $time.");

    echo json_encode(["status" => "success", "message" => "Booking saved"]);
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request"]);
}

$conn->close();
