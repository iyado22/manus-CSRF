<?php

header("Content-Type: application/json");
include(__DIR__."/../../includes/conf.php");
include(__DIR__."/../../includes/CsrfHelper.php");

CsrfHelper::validateToken(); //Validates the CSRF token to prevent CSRF attacks. (Cross-Site Request Forgery)




try{
$admin_id = $_SESSION['user_id'] ?? $_POST['user_id'] ??  null;
$role = $_SESSION['role'] ?? $_POST['role'] ??  null;




if (!$role || !$admin_id) {
    throw new Exception("Missing required fields.");
}

$sql = "SELECT * FROM users WHERE id = ? AND role = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $admin_id, $role);
if (!$stmt->execute()) {
    throw new Exception("SQL execution error.");
}
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    throw new Exception("Unauthorized access.");
}


$page_num = isset($_GET['page']) && is_numeric($_GET['page']) ? intval($_GET['page']) : 1;  //This is ternary operator, it's syntax is: condition ? value_if_true : value_if_false
    $limit = 10;
    $offset = ($page_num - 1) * $limit;

$sql = "SELECT * FROM announcements 
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $limit, $offset);
if (!$stmt->execute()) {
    throw new Exception("SQL statement execution error.");
}
$result = $stmt->get_result();
if(empty($result)){
    throw new Exception("SQL execution error.");
}

$announcements = [];
while($row = $result->fetch_assoc()){
    $announcements [] = $row;
}

echo json_encode(
    [
        "status" => "success!",
        "data" => $announcements
    ]
);


} catch(Exception $e){
    echo json_encode(
        [
            "status" => "error",
            "message" => $e->getMessage()
        ]
    );
}
?>