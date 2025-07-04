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

$sql = "SELECT * FROM work_log WHERE staff_id = ? AND DATE(check_in) = CURDATE() AND check_out IS NULL";
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

if($result->num_rows > 0){
    echo json_encode(
        [
            "status" => "error",
            "message" => "Already checked in and not yet checked out."
        ]
        );
        exit;
}


$sql = "INSERT INTO work_log (staff_id, check_in, date) VALUES (?, NOW(), CURDATE())";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $staff_id);
if(!$stmt->execute()){
    echo json_encode(
        [
            "status" => "error",
            "message" => "Failed to record check-in."
        ]
        );
        exit;
}
else{
    echo json_encode(
        [
            "status" => "success!",
            "message" => "Check-in recorded successfully!",
            "check_in" => date("Y-m-d H:i:s")
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

$checkInData = [
        "staff_id" => $staff_id,
        "staff_name" => $full_name,
        "date" => date("Y-m-d"),
        "time" => date("H:i:s")
    ];

    
    NotificationHelper::notifyAdmins(
    "Staff Check-In",
    "Staff member " . $checkInData['staff_name'] . " checked in on " . $checkInData['date'] . " at " . $checkInData['time'] . "."
);

    NotificationHelper::sendCheckInNotification($staff_id, $checkInData);

$result->close();

$conn->close();




?>