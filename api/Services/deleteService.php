<?php
header("Content-Type: application/json");
include(__DIR__ . '/../../includes/conf.php');
include(__DIR__ . '/../../includes/CsrfHelper.php'); //Include CSRF helper for CSRF token validation.

CsrfHelper::validateToken(); //Validates the CSRF token to prevent CSRF attacks. (Cross-Site Request Forgery)

if($_SERVER['REQUEST_METHOD'] === 'POST')
    {
    $role = $_POST['role'] ?? $_SESSION['role'];
    $admin_id = $_POST['user_id'] ?? $_SESSION['user_id'];
    if($role === 'admin' && $admin_id)
        {
            $service_id = $_POST['service_id'];

            $sql = "DELETE FROM services WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $service_id);
            if(!$stmt->execute())
            {
                echo json_encode
                (
                    [
                       "status" => "error",
                        "message" => "SQL statement execution error"
                    ]
                    );
            }

            echo json_encode
                (
                    [
                       "status" => "success!",
                        "message" => "Service removed successfully!"
                    ]
                    );

        }
        else{
            echo json_encode
                (
                    [
                       "status" => "error",
                        "message" => "You are not authorized to perform this action"
                    ]
                    );
        }
    }
    else{
echo json_encode
                (
                    [
                       "status" => "error",
                        "message" => "Request type issue"
                    ]
                    );
    }
    



?>