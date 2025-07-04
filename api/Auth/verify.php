<?php
// Sets the header to return JSON, useful for Postman or JS apps
header("Content-Type: application/json");




// Database connection
include(__DIR__ . '/../../includes/conf.php');


// Retrieves values from the POST request (entered by user)
$email = $_POST["email"] ?? $_SESSION['email'] ?? null;
$entered_code = $_POST["entered_code"] ?? null;

// Checks that both fields were provided
if (!$email || !$entered_code) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing email or verification code"
    ]);
    exit;
}

// Prepares SQL query to fetch the code associated with this email
$sql = "SELECT verify_code FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);                      // Preparing the query
$stmt->bind_param("s", $email);                    // Binding the email to the placeholder
$stmt->execute();                                  // Executing the query
$stmt->bind_result($stored_code);                  // Binds the result (the code) to $stored_code
$stmt->fetch();                                    // Fetches the value into $stored_code
$stmt->close();                                    // Closes the statement

// Compares user-entered code with what's in the database
if ($entered_code === $stored_code) {

    // If correct, update the user row to mark as verified and remove the code
    $update = $conn->prepare("UPDATE users SET is_verified = 1, verify_code = NULL WHERE email = ?");
    $update->bind_param("s", $email);              // Binds email to the update query
    $update->execute();                            // Executes the update
    $update->close();                              // Closes the statement

    // Sends success response
    echo json_encode([
        "status" => "success",
        "message" => "Verification successful"
    ]);
} else {
    // Sends error if code does not match
    echo json_encode([
        "status" => "error",
        "message" => "Incorrect verification code"
    ]);
}
?>
