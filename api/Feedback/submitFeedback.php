<?php 
header("Content-Type: application/json");
include(__DIR__ . '/../../includes/conf.php');
include(__DIR__ . '/../../includes/NotificationHelper.php');
include(__DIR__ . '/../../includes/CsrfHelper.php'); //Including CSRF helper to prevent CSRF attacks.

CsrfHelper::validateToken(); //Validates the CSRF token to prevent CSRF attacks. (Cross-Site Request Forgery)

$client_id = $_SESSION['user_id'] ?? $_POST['user_id'] ??  null;
$role = $_SESSION['role'] ?? $_POST['role'] ?? null;
if(!$client_id || $role !== 'client')
{
    echo json_encode
    (
        [
            "status" => "error",
            "message" => "User not authenticated or not a client"     
        ]
    );
    exit;
}

if($client_id && $_SERVER['REQUEST_METHOD'] === 'POST')
{
    $booking_id = $_POST['booking_id'];
    $rating = $_POST['rating'];
    $comment = $_POST['comment'];

    if(!$booking_id || !$rating)
    {
        echo json_encode
        (
            [
                "status" => "error",
                "message" => "Required feedback field missing"     
            ]
        );

        exit;
    }

    $statusCheckSQL = "SELECT status FROM appointments WHERE id = ? AND client_id = ?";
    $statusStmt = $conn->prepare($statusCheckSQL);
    $statusStmt->bind_param("ii", $booking_id, $client_id);
    $statusStmt->execute();
    $statusResult = $statusStmt->get_result();
    if($statusResult->num_rows === 0)
    {
        echo json_encode
        (
            [
                "status" => "error",
                "message" => "No appointment found for this booking ID"     
            ]
        );

        exit;
    }
    $statusRow = $statusResult->fetch_assoc();
    $status = $statusRow['status'];
    $statusStmt->close();
    if($status !== 'completed')
    {
         echo json_encode
        (
            [
                "status" => "error",
                "message" => "Feedback can only be submitted for completed appointments"     
            ]
        );

        exit;
    }


    $sql = "INSERT INTO feedback (booking_id, client_id, rating, comment) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iiis", $booking_id, $client_id, $rating, $comment);
    if(!$stmt->execute())
    {
         echo json_encode
        (
            [
                "status" => "error",
                "message" => "SQL statement execution error"     
            ]
        );

        exit;
    }

    $stmt = $conn->prepare("
    SELECT s.name AS service_name, a.date, a.time, a.status, u.full_name
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    JOIN users u ON a.client_id = u.id
    WHERE a.id = ?
    ");
    $stmt->bind_param('i', $booking_id);
    $stmt->execute();
    $stmt->bind_result($service_name, $date, $time, $status, $user_name);
    if(!$stmt->fetch()) {
    echo json_encode([
        "status" => "error",
        "message" => "Failed to retrieve appointment details for notification!"
    ]);
    exit;
}
    $stmt->close();


    $feedbackData = [
        'booking_id' => $booking_id,
        'user_name' => $user_name,
        'rating' => $rating,
        'comment' => $comment];
        


    NotificationHelper::sendFeedbackNotification($client_id, $feedbackData); //Sending a notification to the user that the feedback has been submitted.

     echo json_encode
        (
            [
                "status" => "success!",
                "message" => "Feedback submitted successfully!"     
            ]
        );

        
}

else
{
     echo json_encode
        (
            [
                "status" => "error",
                "message" => "User identification issue"     
            ]
        );

        exit;
}

$conn->close();

?>