<?php 
header("Content-Type: application/json");
include(__DIR__ . '/../../includes/conf.php');



if($_SERVER['REQUEST_METHOD'] === 'POST'){
$email = $_POST["email"] ?? $_SESSION['email_to_verify'] ?? null;
$entered_code = $_POST["entered_code"] ?? null;

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

if($entered_code !== $stored_code){

   echo json_encode(
        [
            "status" => "error",
            "message" => "Wrong code."
        ]
    );
    exit;
}
$sql = "UPDATE users SET verify_code = null WHERE email = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $email);
        if(!$stmt->execute()){
            echo json_encode([
        "status" => "error",
        "message" => "SQL execution error."
    ]);
    exit;
        }
        
        echo json_encode([
        "status" => "success!",
        "message" => "Move on to the reset password page."
    ]);
}
else{
    echo json_encode(
        [
            "status" => "error",
            "message" => "Invalid request method."
        ]
    );
}

?>
