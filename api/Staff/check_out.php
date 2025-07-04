<?php 
header("Content-Type: application/json");
include(__DIR__."/../../includes/conf.php");
include(__DIR__ . "/../../includes/CsrfHelper.php");
include(__DIR__ . "/../../includes/NotificationHelper.php");

CsrfHelper::validateToken(); //Validates the CSRF token to prevent CSRF attacks. (Cross-Site Request Forgery)
date_default_timezone_set('Asia/Jerusalem');

$staff_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;
$role = $_POST['role'] ?? $_SESSION['role'] ?? null;

if (!$role || !$staff_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized access"
    ]);
    exit;
}

$sql = "SELECT id FROM users WHERE id = ? AND role = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $staff_id, $role);
if(!$stmt->execute()){
    echo json_encode(
        [
            "status" => "error",
            "message" => "SQL execution error."
        ]
        );
        exit;
}
$result = $stmt->get_result();
if($result->num_rows === 0){
    echo json_encode(
        [
            "status" => "error",
            "message" => "Unauthorized access."
        ]
        );
        exit;
}
$stmt->close();


$sql = "SELECT id, check_in FROM work_log 
        WHERE staff_id = ? 
        AND DATE(check_in) = CURDATE() 
        AND check_out IS NULL 
        ORDER BY check_in DESC 
        LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $staff_id);
if(!$stmt->execute()){
    echo json_encode(
        [
            "status" => "error",
            "message" => "SQL execution error."
        ]
        );
        exit;
}
$result = $stmt->get_result();

if($result->num_rows === 0){
    echo json_encode(
        [
            "status" => "error",
            "message" => "No active check-ins found today."
        ]
        );
        exit;
}

$row = $result->fetch_assoc();
$work_log_id = $row['id'];
$check_in_time = new DateTime($row['check_in']);        //DateTime is a class a smart class and a recommended way to represent date/time values and do some calculations at them.
$check_out_time = new DateTime();

$interval = $check_in_time->diff($check_out_time);
$duration_minutes = ($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i;


$sql = "UPDATE work_log 
        SET check_out = NOW(), duration_minutes = ?, date = CURDATE()
        WHERE id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $duration_minutes, $work_log_id);

if(!$stmt->execute()){
    echo json_encode(
        [
            "status" => "error",
            "message" => "SQL execution error."
        ]
        );
        exit;
}
else{
    echo json_encode(
        [
            "status" => "success!",
            "message" => "Check-out recorded successfully!",
            "check-in"=> $check_in_time->format("Y-m-d H:i:s"),
            "check-out" => $check_out_time->format("Y-m-d H:i:s"),
            "worked_minutes" => $duration_minutes
        ]
        );
}

$sql = "SELECT full_name FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $staff_id);
if(!$stmt->execute()){
    echo json_encode(
        [
            "status" => "error",
            "message" => "Failed to retrieve staff name."
        ]
        );
        exit;
}
$stmt->bind_result($full_name);
$stmt->fetch();
$stmt->close();

$checkOutData = [
    "staff_id" => $staff_id,
    "staff_name" => $full_name,
    "date" => date("Y-m-d"),
    "time" => date("H:i:s"),
    "duration_minutes" => $duration_minutes
];

    NotificationHelper::notifyAdmins(
    "Staff Check-Out",
    "Staff member " . $checkOutData['staff_name'] . " checked-out on " . $checkOutData['date'] . " at " . $checkOutData['time'] . "."
);

    NotificationHelper::sendCheckOutNotification($staff_id, $checkOutData);



$conn->close();

?>