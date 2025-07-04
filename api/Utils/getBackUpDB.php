<?php 
header("Content-Type: application/json");
include(__DIR__."/../../includes/conf.php");
session_start();
CsrfHelper::validateToken(); //Validates the CSRF token to prevent CSRF attacks. (Cross-Site Request Forgery)

try {
    // Verify admin authorization
    $admin_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;
    $role = $_POST['role'] ?? $_SESSION['role'] ?? null;

    if ($role !== 'admin' || !$admin_id) {
        throw new Exception("Unauthorized access.");
    }

    // Set backup file name with timestamp
    $backup_file = 'db_backup_' . date("Y-m-d_H-i-s") . '.sql';
    $backup_path = __DIR__ . '/../../backups/';

    // Create backups directory if it doesn't exist
    if (!is_dir($backup_path)) {
        mkdir($backup_path, 0777, true);
    }

    $mysqldumpPath = 'C:\\xampp\\mysql\\bin\\mysqldump.exe';  // full path to mysqldump
$command = sprintf(
    '"%s" --host=%s --user=%s --password=%s %s > "%s"',
    $mysqldumpPath,
    DB_HOST,
    DB_USER,
    DB_PASS,
    DB_NAME,
    $backup_path . $backup_file
);

    // Execute backup command
    exec($command, $output, $return_var);

    if ($return_var !== 0) {
        throw new Exception("Database backup failed.");
    }

    echo json_encode([
        "status" => "success",
        "message" => "Database backup created successfully",
        "file" => $backup_file
    ]);

} catch(Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>