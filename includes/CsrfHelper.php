<?php
// includes/CsrfHelper.php

class CsrfHelper
{
    public static function generateToken()
    {
        // If token is not already generated for this session, create it
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32)); // 64 char token
        }

        return $_SESSION['csrf_token'];
    }

    public static function validateToken()
{
    if (session_status() === PHP_SESSION_NONE) {
    
}
    $sessionToken = $_SESSION['csrf_token'] ?? '';

    // Check POST body
    $token = $_POST['csrf_token'] ?? null;

    // Or check HTTP header
    if (!$token && isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
        $token = $_SERVER['HTTP_X_CSRF_TOKEN'];
    }

    if (!$token || $token !== $sessionToken) {
        echo json_encode(["status" => "error", "message" => "Invalid CSRF token."]);
        http_response_code(403);
        exit();
    }
}

}
?>
