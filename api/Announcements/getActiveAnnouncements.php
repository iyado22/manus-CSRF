
<?php
header("Content-Type: application/json");
include(__DIR__ . "/../../includes/conf.php");



try {
    $sql = "SELECT message FROM announcements WHERE is_active = 1 ORDER BY created_at DESC LIMIT 5";
    $stmt = $conn->prepare($sql);

    if (!$stmt->execute()) {
        throw new Exception("SQL execution error.");
    }

    $result = $stmt->get_result();
    $announcements = [];

    while ($row = $result->fetch_assoc()) {
        $announcements[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "data" => $announcements
    ]);
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

$stmt->close();
$conn->close();
?>
