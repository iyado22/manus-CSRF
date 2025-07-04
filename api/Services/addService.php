<?php
header("Content-Type: application/json");
include(__DIR__ . '/../../includes/conf.php');  //Connects with the database
include(__DIR__ . '/../../includes/CsrfHelper.php');  //Connects with the CSRF helper class

CsrfHelper::validateToken(); //Validates the CSRF token to prevent CSRF attacks. (Cross-Site Request Forgery)

$role = $_SESSION['role'] ?? $_POST['role'] ?? null;
$admin_id = $_SESSION['user_id'] ?? $_POST['user_id'] ?? null;


 if($role === 'admin' && $admin_id && $_SERVER['REQUEST_METHOD'] === 'POST') 
 {

    //This block of code is responsible of handling the storing process of the image uploaded by the admin
    if(isset($_FILES['image']) && $_FILES['image']['error'] === 0) //Checks if there's a file named 'image', and checks that there's no errors  
    {
        $tmp_path = $_FILES['image']['tmp_name'];        //PHP stores the image file in a temporary path, we stored that path in a variable
        $imgName = basename($_FILES['image']['name']);   //Removes the directory and only stores the file name
        $targetDir = __DIR__. '/../../uploads/';        //Stores the directory where the image will be stored.
        $target_path = $targetDir.$imgName;             //Concatenate the directory with the name of the image, and we'll be having the target path ready

        if(!move_uploaded_file($tmp_path, $target_path))   //This method moves the file from the old location to a new destination
        {
             echo json_encode(
        [   
            "status" => "error",
            "message" => "Failed to upload the image"
        ]
    );
        }

        $relative_path = 'uploads/' . $imgName;         //This variable is for stroing the path relatively in the database
    }
    else{
        $relative_path = null;
    }

    $name = $_POST['name'];
    $price = $_POST['price'];
    $description = $_POST['description'];
    $duration = $_POST['duration'];

    $sql = "INSERT INTO services (name, description, price, duration, image_path) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssiis", $name, $description, $price, $duration, $relative_path);
    if(!$stmt->execute())
    {
        echo json_encode(
        [
            "status" => "error",
            "message" => "SQL statement execution error"
        ]
    );
    }

    echo json_encode(
        [
            "status" => "success",
            "message" => "Service added successfully!"
        ]
    );
 }
 else{
    echo json_encode(
        [
            "status" => "error",
            "message" => "Admin identification error"
        ]
    );
 }



?>

