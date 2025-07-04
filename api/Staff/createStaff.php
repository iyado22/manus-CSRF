<?php 
header("Content-Type: application/json");
include (__DIR__."/../../includes/conf.php");




$role = $_POST['role'] ?? $_SESSION['role'] ?? null;
$admin_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;


$sql = "SELECT * FROM users WHERE id = ? and role = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $admin_id, $role);
$stmt->execute();
$result = $stmt->get_result();
if($result->num_rows === 0){
    echo json_encode([
                "status" => "error",
                "message" => "Unauthorized access."
            ]);
            exit;
}

if($_SERVER['REQUEST_METHOD'] === 'POST' && $role === 'admin' && $admin_id) {
    $full_name = $_POST['full_name'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $password_confirm = $_POST['password_confirm'];
    $phone = $_POST['phone'];
    $dob = $_POST['dob'];
    $salary_per_hour = $_POST['salary_per_hour'] ?? 0;
    $notes = $_POST['notes'] ?? '';

    $required = ['full_name', 'email', 'password', 'password_confirm', 'phone', 'dob'];
    foreach ($required as $field) {
        if(empty($_POST[$field])) {
            echo json_encode([
                "status" => "error",
                "message" => "Missing required field"
            ]);
            exit;
        }
    }

    if($password !== $password_confirm) {
        echo json_encode([
            "status" => "error",
            "message" => "Passwords do not match"
        ]);
        exit;
    }

    $sql = "SELECT * FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    if(!$stmt->execute()) {
        echo json_encode([
            "status" => "error",
            "message" => "SQL execution error"
        ]);
        exit;
    }


    $result = $stmt->get_result();
    if($result->num_rows > 0) {
        echo json_encode([
            "status" => "error",
            "message" => "Email already registered"
        ]);
        exit;
    }
    $stmt->close();

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    $sql = "INSERT INTO users (full_name, email, password, phone, dob, role, is_verified ) VALUES (?, ?, ?, ?, ?, 'staff', 1)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssss", $full_name, $email, $hashed_password, $phone, $dob);
    if(!$stmt->execute()) {
        echo json_encode([
            "status" => "error",
            "message" => "SQL execution error"
        ]);
        exit;
    }

    $staff_id = $conn->insert_id;

    $date_registered = date('Y-m-d');   

    $sql = "INSERT INTO staff_details (staff_id, salary_per_hour, notes, date_registered) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("idss", $staff_id, $salary_per_hour, $notes, $date_registered);
    if(!$stmt->execute()) {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to create staff details."
        ]);
        exit;
    }

    echo json_encode([
        "status" => "success!",
        "message" => "Staff member registered and profile created successfully!"
    ]);

    $stmt->close();
}

$conn->close();
?>
