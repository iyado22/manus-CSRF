<?php 
header("Content-Type: application/json");

include(__DIR__ . '/../../includes/conf.php');
include(__DIR__ . '/../../includes/CsrfHelper.php');
CsrfHelper::validateToken();

file_put_contents("debug.txt", print_r($_POST, true));


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $role = $_POST['role'] ?? $_SESSION['role'] ?? null;
    $admin_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;

    if ($role !== 'admin' || !$admin_id) {
        echo json_encode([
            "status" => "error",
            "message" => "Unauthorized"
        ]);
        exit;
    }

    $service_id = $_POST['service_id'] ?? null;
    if (!$service_id) {
        echo json_encode([
            "status" => "error",
            "message" => "Missing service ID"
        ]);
        exit;
    }

    // Initialize fields
    $fields = [];
    $types = "";
    $values = [];

    if (isset($_POST['name'])) {
        $fields[] = "name = ?";
        $types .= "s";
        $values[] = $_POST['name'];
    }

    if (isset($_POST['description'])) {
        $fields[] = "description = ?";
        $types .= "s";
        $values[] = $_POST['description'];
    }

    if (isset($_POST['price']) && is_numeric($_POST['price'])) {
        $fields[] = "price = ?";
        $types .= "d";
        $values[] = $_POST['price'];
    }

    if (isset($_POST['duration']) && is_numeric($_POST['duration'])) {
        $fields[] = "duration = ?";
        $types .= "i";
        $values[] = $_POST['duration'];
    }

    // Image handling (with your comments preserved)
    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) // Checks if there's a file named 'image', and checks that there's no errors  
    {
        $tmp_path = $_FILES['image']['tmp_name'];        // PHP stores the image file in a temporary path, we stored that path in a variable
        $imgName = basename($_FILES['image']['name']);   // Removes the directory and only stores the file name
        $targetDir = __DIR__ . '/../../uploads/';        // Stores the directory where the image will be stored.
        $target_path = $targetDir . $imgName;            // Concatenate the directory with the name of the image, and we'll be having the target path ready

        if (!move_uploaded_file($tmp_path, $target_path))   // This method moves the file from the old location to a new destination
        {
            echo json_encode([
                "status" => "error",
                "message" => "Failed to upload the image"
            ]);
            exit;
        }

        $image_path = 'uploads/' . $imgName;         // This variable is for storing the path relatively in the database
        $fields[] = "image_path = ?";
        $types .= "s";
        $values[] = $image_path;
    }

    if (empty($fields)) {
        echo json_encode([
            "status" => "error",
            "message" => "No fields to update"
        ]);
        exit;
    }

    $sql = "UPDATE services SET " . implode(", ", $fields) . " WHERE id = ?";
    error_log($sql);
    $types .= "i";
    $values[] = $service_id;

    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$values);

    if ($stmt->affected_rows > 0) {
    echo json_encode(["status" => "success", "message" => "Updated!"]);
} else {
    echo json_encode(["status" => "warning", "message" => "No rows affected. Data may be identical or service_id may be wrong."]);
}


    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success!",
            "message" => "Service modified successfully!"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "SQL execution error"
        ]);
    }

    $stmt->close();
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid request method"
    ]);
}

$conn->close();
?>
