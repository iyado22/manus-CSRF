<?php 
header("Content-Type: application/json");
include(__DIR__ . '/../../includes/conf.php');  //Connects with the database.


$client_id = $_SESSION['user_id'] ?? $_POST['user_id'] ?? null;
$role = $_SESSION['role'] ?? $_POST['role'] ??null;




if (!$client_id || $role !== 'client') {
    echo json_encode([
        "status" => "error",
        "message" => "User not found or not a client"
    ]);
    exit;
}


$sql = "SELECT id FROM users WHERE id = ? AND role = 'client' AND is_active = 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $client_id);
if(!$stmt->execute())
{
    echo json_encode(
        [
            "status" => "error", 
            "message" => "SQL statement execution error"
        ]
    );
    exit;
}
$stmt->bind_result($id);
$result = $stmt->fetch();
$stmt->close();

if(!$result || !$id || $role !== 'client')
{
    echo json_encode(
        [
            "status" => "error", 
            "message" => "User not found or not a client"
        ]
    );
    exit;
}


     $page_num = isset($_POST['page']) && is_numeric($_POST['page']) ? intval($_POST['page']) : 1;
    $limit = 10;
    $offset = ($page_num - 1) * $limit;

    // Count total appointments for this client
    $countSql = "SELECT COUNT(*) as total FROM appointments WHERE client_id = ?";
    $countStmt = $conn->prepare($countSql);
    $countStmt->bind_param("i", $client_id);
    $countStmt->execute();
    $countResult = $countStmt->get_result();
    $totalAppointments = $countResult->fetch_assoc()['total'];
    $countStmt->close();


    // SQL query to fetch appointments for the client
    // Including service name, staff name, price, date, and time
    $sql = "
    SELECT 
    a.id AS appointment_id,
    s.name AS service_name, 
    staff.full_name as staff_name,
    s.price,
    a.date,
    a.time, 
    a.status
    FROM appointments a
    JOIN users u ON a.client_id = u.id
    LEFT JOIN users staff ON a.staff_id = staff.id
    JOIN services s ON a.service_id = s.id 
    WHERE a.client_id = ?
    ORDER BY a.date DESC, a.time DESC
    ";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $client_id);
    if(!$stmt->execute())
    {
        echo json_encode(
            [
                "status" => "error", 
                "message" => "SQL statement execution error"
            ]
        );
    }

    $result = $stmt->get_result();
    $appointments = [];
    while($row = $result->fetch_assoc())
    {
        $appointments [] = $row;
    }

    echo json_encode(
        [
            "status" => "success",
            "data" => [
                "appointments" => $appointments,
                "total" => $totalAppointments
            ] 
        ]
    );

    $stmt->close();


$conn->close();

?>