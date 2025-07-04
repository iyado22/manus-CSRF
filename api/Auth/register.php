<?php 

// Sets the header to return JSON, useful for Postman or JS apps
header("Content-Type: application/json");



//Database connection
include(__DIR__ . '/../../includes/conf.php');


//Getting data from the submitted form
if($_SERVER['REQUEST_METHOD']=='POST')
{$full_name = $_POST['full_name'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $password_confirm = $_POST['password_confirm'];
    $phone = $_POST['phone'];
    $dob = $_POST['dob'];


//Validating password
if($password !== $password_confirm)
    die("Passwords do not match");

//Checking if the email submitted is already used
$sql = "SELECT id FROM users WHERE email = ?";      //Sql statement checks that if there's an id for a user who has this email, used a '?' placeholder so the real email value will be inserted safely during execution
$stmt = $conn->prepare($sql);                       //Preparing the query template ($stmt is now my interface object to the query)
$stmt->bind_param("s",$email);                      //Binding the actual value of $email to the '?' placeholder
$stmt->execute();                                   //Executing (running) the query
$stmt->store_result();                              //Stroing the result to the object
if($stmt->num_rows > 0){                            //An if statement to check if there's a least one row returned from that qurey, to make sure if this email has been already registered.
    die("Email already registered");                //Show the error message
$stmt->close();                                     //Close the statement object
}

//Hashing password
$hashed_password = password_hash($password, PASSWORD_DEFAULT); //'PASSWORD_DEFAULT' is a reference name to a hashing algorithm (bycript)

//Generating a verification code
$verify_code = rand(100000, 999999);


//Inserting a new user
$sql = "INSERT INTO users (full_name, email, password, phone, dob, verify_code) VALUES (?,?,?,?,?,?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssss", $full_name, $email, $hashed_password, $phone, $dob, $verify_code);
$stmt->execute();
$stmt->close();

//Sending the code to user's email
require __DIR__ . '/../../includes/send_mail.php';      //Including the sendmail.php file so we could use the function we created inside it
$sent = send_verification_email($email, $full_name, $verify_code, 'register'); //Calling the function to send the email, passing the email, full name, verification code and type of email (registration in this case)
if($sent){                                                              //Checks if the code sending went successfully
    $_SESSION['email_to_verify'] = $email;
    header("Location: verify.php?status=code_sent");
     echo json_encode(
        [
            "status" => "success!",
            "message" => "Verification code sent successfully! Check your email."
        ]
    );
    exit;
}
else {
    echo "<script> alert('Failed to send verification code. Try again.');</script>";
}
}



?> 