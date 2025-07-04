<?php 
header("Content-Type: application/json");
include (__DIR__. '/../../includes/conf.php');


$role = $_POST['role'] ?? $_SESSION['role'] ?? null;
$staff_admin_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;



if($staff_admin_id && ($role === 'admin' || $role === 'staff'))
{

    $sql = "SELECT id FROM users WHERE id = ? AND (role = 'admin' OR role = 'staff') AND is_active = 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $staff_admin_id);
    if (!$stmt->execute()) {
        echo json_encode([
            "status" => "error",
            "message" => "SQL statement execution failed"
        ]);
        exit;
    }
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        echo json_encode([
            "status" => "error",
            "message" => "Invalid user ID or insufficient permissions"
        ]);
        exit;
    }

    $page_num = isset($_GET['page']) && is_numeric($_GET['page']) ? intval($_GET['page']) : 1;  //This is ternary operator, it's syntax is: condition ? value_if_true : value_if_false
    $limit = 10;
    $offset = ($page_num - 1) * $limit;

    $sql = "SELECT
    f.id AS feedback_id,
    u.full_name AS client_name,
    s.name AS service_name,
    f.rating,
    f.comment,
    f.created_at
    FROM feedback f
    JOIN users u ON f.client_id = u.id
    JOIN appointments a ON f.booking_id = a.id
    JOIN services s ON a.service_id = s.id
    ORDER BY f.created_at DESC
    LIMIT ? OFFSET ?
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $limit, $offset);
    if (!$stmt->execute()) {
    echo json_encode([
        "status" => "error",
        "message" => "SQL statement execution failed"
    ]);
    exit;
}

    $result = $stmt->get_result();
    $feedbacks = [];
    
    while ($row = $result->fetch_assoc())
        $feedbacks[] = $row;
    
     echo json_encode([
        "status" => "success!",
        "current_page" => $page_num,
        "data" => $feedbacks
    ]);

    $stmt->close();
}

else{
     echo json_encode(
       [
            "status" => "error",
            "message" => "Admin identification error"
       ]     
       );
}

$conn->close();
?>