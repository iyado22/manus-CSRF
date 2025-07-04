<?php
header("Content-Type: application/json");
include(__DIR__ . "/../../includes/conf.php");
include(__DIR__ . "/../../includes/CsrfHelper.php");
file_put_contents(__DIR__ . '/debug.log', json_encode([
    'SESSION' => $_SESSION,
    'POST' => $_POST,
    'HEADER_X_CSRF' => $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null
], JSON_PRETTY_PRINT));
            
CsrfHelper::validateToken();

// Cache mechanism (30s)
if (isset($_SESSION['dashboard_cache']) && time() - $_SESSION['dashboard_cache']['timestamp'] < 30) {
    $cached_response = $_SESSION['dashboard_cache'];
    $cached_response['cached'] = true;
    echo json_encode($cached_response);
    exit;
}

$admin_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;
$role = $_POST['role'] ?? $_SESSION['role'] ?? null;

if (!$admin_id || !$role) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing required parameters."
    ]);
    exit;
}

$sql  = "SELECT * FROM users WHERE id = ? AND role = 'admin'";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $admin_id);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized access."
    ]);
    exit;
}

function getSingleValue($conn, $sql, $column_name, $error_msg) {
    $result = $conn->query($sql);
    if ($result && $row = $result->fetch_assoc()) {
        $result->close();
        return $row[$column_name];
    } else {
        echo json_encode([
            "status" => "error",
            "message" => $error_msg
        ]);
        exit;
    }
}

function getMultipleRows($conn, $sql, $error_msg) {
    $result = $conn->query($sql);
    $data = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        $result->close();
        return $data;
    } else {
        return [];
    }
}

$total_clients = getSingleValue($conn, "SELECT COUNT(*) AS total_clients FROM users WHERE role = 'client'", 'total_clients', "SQL1 error");
$total_staff = getSingleValue($conn, "SELECT COUNT(*) AS total_staff FROM users WHERE role = 'staff'", 'total_staff', "SQL2 error");
$today_appointments = getSingleValue($conn, "SELECT COUNT(*) AS today_appointments FROM appointments WHERE DATE(date) = CURDATE()", 'today_appointments', "SQL3 error");
$week_appointments = getSingleValue($conn, "SELECT COUNT(*) AS week_appointments FROM appointments WHERE WEEK(date) = WEEK(CURDATE()) AND YEAR(date) = YEAR(CURDATE())", 'week_appointments', "SQL4 error");
$total_appointments = getSingleValue($conn, "SELECT COUNT(*) AS total_appointments FROM appointments", 'total_appointments', "SQL5 error");

$top_services = getMultipleRows($conn, "SELECT s.name, COUNT(*) AS bookings FROM appointments a JOIN services s ON a.service_id = s.id GROUP BY s.id ORDER BY bookings DESC LIMIT 5", "SQL6 error");

$total_revenue = getSingleValue($conn, "SELECT SUM(price) AS total_revenue FROM appointments", 'total_revenue', "SQL7 error");
$today_revenue = getSingleValue($conn, "SELECT SUM(price) AS today_revenue FROM appointments WHERE DATE(date) = CURDATE()", 'today_revenue', "SQL7.1 error");
$month_revenue = getSingleValue($conn, "SELECT SUM(price) AS month_revenue FROM appointments WHERE MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())", 'month_revenue', "SQL7.2 error");
$year_revenue = getSingleValue($conn, "SELECT SUM(price) AS year_revenue FROM appointments WHERE YEAR(date) = YEAR(CURDATE())", 'year_revenue', "SQL7.3 error");

$status_counts = [
    'completed' => 0,
    'pending' => 0,
    'cancelled' => 0
];

$status_result = $conn->query("SELECT status, COUNT(*) AS count FROM appointments GROUP BY status");
if ($status_result) {
    while ($row = $status_result->fetch_assoc()) {
        $status = $row['status'];
        if (isset($status_counts[$status])) {
            $status_counts[$status] = $row['count'];
        }
    }
    $status_result->close();
}

$services_avg_rating = getMultipleRows($conn, "SELECT ROUND(AVG(f.rating), 2) AS average_rating, s.name AS service_name FROM feedback f JOIN appointments a ON f.booking_id = a.id JOIN services s ON a.service_id = s.id GROUP BY s.id ORDER BY average_rating DESC", "SQL11 error");

$staff_avg_rating = getMultipleRows($conn, "SELECT ROUND(AVG(f.rating), 2) AS average_rating, u.full_name AS staff_name FROM feedback f JOIN appointments a ON f.booking_id = a.id JOIN users u ON a.staff_id = u.id WHERE u.role = 'staff' GROUP BY u.id ORDER BY average_rating DESC", "SQL12 error");

$response = [
    "status" => "success!",
    "total_clients" => $total_clients,
    "total_staff" => $total_staff,
    "today_appointments" => $today_appointments,
    "week_appointments" => $week_appointments,
    "total_appointments" => $total_appointments,
    "top_services" => $top_services,
    "today_revenue" => $today_revenue,
    "month_revenue" => $month_revenue,
    "year_revenue" => $year_revenue,
    "total_revenue" => $total_revenue,
    "completed_appointments" => $status_counts['completed'],
    "pending_appointments" => $status_counts['pending'],
    "cancelled_appointments" => $status_counts['cancelled'],
    "services_avg_rating" => $services_avg_rating,
    "staff_avg_rating" => $staff_avg_rating,
    "generated_at" => date("Y-m-d H:i:s")
];

$_SESSION['dashboard_cache'] = [
    "timestamp" => time(),
    "data" => $response
];

echo json_encode($response);
$conn->close();
