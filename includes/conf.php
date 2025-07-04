<?php
// ✅ Prevent early output
ob_start();

// ✅ Allow all cross-origin requests from frontend
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';

// Only allow your frontend during development
$allowedOrigins = ['http://localhost:3000'];

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}
else {
    header("Access-Control-Allow-Origin: http://localhost:3000"); // fallback default during dev
}
// ✅ CORS Headers
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, x-csrf-token");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// ✅ Handle preflight request (CORS check)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ✅ Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ✅ Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "noor_alshams_db";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit();
}
?>
