<?php 
header("Content-Type: application/json");
include(__DIR__ . '/../../includes/conf.php');
 

if($_SERVER['REQUEST_METHOD'] === 'POST'){
    $email = $_POST['email'];
    $full_name = $_POST['full_name'];
    
    $sql = "SELECT id FROM users WHERE email = ?";      //Sql statement checks that if there's an id for a user who has this email, used a '?' placeholder so the real email value will be inserted safely during execution
    $stmt = $conn->prepare($sql);                       //Preparing the query template ($stmt is now my interface object to the query)
    $stmt->bind_param("s",$email);                      //Binding the actual value of $email to the '?' placeholder
    $stmt->execute();                                   //Executing (running) the query
    $stmt->store_result();                              //Stroing the result to the object
    if($stmt->num_rows !== 1){                            //An if statement to check if there's a least one row returned from that qurey, to make sure if this email has been already registered.
    echo json_encode(
        [
            "status" => "error",
            "message" => "This email isn't registered"    
        ]
        );             
        exit();                                  
    }
    $stmt->close();

    $verify_code = rand(100000, 999999);

    $sql = "UPDATE users SET verify_code = ? WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("is", $verify_code, $email);
     if(!$stmt->execute()){
            echo json_encode([
        "status" => "error",
        "message" => "SQL execution error."
    ]);
    exit;
        }


    require __DIR__. '/../../includes/send_mail.php';
    $sent = send_verification_email($email, $full_name, $verify_code, 'forgot'); //Calling the function to send the email, passing the email, full name, verification code and type of email (forgot password in this case)

    if($sent){                                                              //Checks if the code sending went successfully
    $_SESSION['email_to_verify'] = $email;
     echo json_encode(
        [
            "status" => "success!",
            "message" => "Verification code sent successfully! Check your email."
        ]
    );
    exit;
}
else {
    echo json_encode(
        [
            "status" => "error",
            "message" => "Failed to send verification code."
        ]
    );
}
}
?>