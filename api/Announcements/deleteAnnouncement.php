<?php
header("Content-Type: application/json");
include(__DIR__ . "/../../includes/conf.php");
include(__DIR__."/../../includes/CsrfHelper.php");
CsrfHelper::validateToken(); //Validates the CSRF token to prevent CSRF attacks. (Cross-Site Request Forgery)



try {
    // Step 1: Get required values
    $admin_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;
    $role = $_POST['role'] ?? $_SESSION['role'] ?? null;
    $announcement_id = $_POST['announcement_id'] ?? null;

    // Step 2: Basic validation
    if (!$admin_id || !$role || !$announcement_id) {
        throw new Exception("Missing required fields.");
    }

    if ($role !== 'admin') {
        throw new Exception("Unauthorized: only admin can delete announcements.");
    }

    // Step 3: Delete announcement
    $stmt = $conn->prepare("DELETE FROM announcements WHERE id = ?");
    $stmt->bind_param("i", $announcement_id);
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to delete announcement.");
    }

    echo json_encode([
        "status" => "success",
        "message" => "Announcement deleted successfully"
    ]);

    $stmt->close();
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

$conn->close();
?>
