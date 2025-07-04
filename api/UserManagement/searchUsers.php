<?php
header("Content-Type: application/json");
include(__DIR__ . "/../../includes/conf.php");
include(__DIR__."/../../includes/CsrfHelper.php");
// CsrfHelper::validateToken(); //Validates the CSRF token to prevent CSRF attacks. (Cross-Site Request Forgery)

$role = $_POST['role'] ?? $_SESSION['role'] ?? null;
$admin_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;

$page_num = isset($_GET['page']) && is_numeric($_GET['page']) ? intval($_GET['page']) : 1;
$limit = 10;
$offset = ($page_num - 1) * $limit;

if ($role === 'admin' && $admin_id) {

    // Build base query and dynamic filters
    $filter_sql = "";
    $params = [];
    $types = '';

    if (isset($_POST['user_name']) && !empty($_POST['user_name'])) {
        $filter_sql .= " AND u.full_name LIKE ? ";
        $params[] = '%' . $_POST['user_name'] . '%';
        $types .= 's';
    }

    if (isset($_POST['user_role']) && !empty($_POST['user_role'])) {
        $filter_sql .= " AND u.role = ? ";
        $params[] = $_POST['user_role'];
        $types .= 's';
    }

    if (isset($_POST['status']) && $_POST['status'] !== '') {
    if ($_POST['status'] === 'active') {
        $filter_sql .= " AND u.is_active = 1 ";
    } elseif ($_POST['status'] === 'inactive') {
        $filter_sql .= " AND u.is_active = 0 ";
    }
}


    // First, run COUNT query to get total_results
    $count_sql = "SELECT COUNT(*) FROM users u WHERE is_verified = 1 " . $filter_sql;
    $count_stmt = $conn->prepare($count_sql);

    if ($types !== '') {
        $count_stmt->bind_param($types, ...$params);
    }

    $count_stmt->execute();
    $count_stmt->bind_result($total_results);
    $count_stmt->fetch();
    $count_stmt->close();

    $total_pages = ceil($total_results / $limit);

    // Now run main SELECT query with LIMIT/OFFSET
    $main_sql = "
        SELECT u.id AS user_id,
               u.full_name,
               u.phone,
               u.email,
               u.dob,
               u.role,
               u.is_active,
               u.is_verified,
               u.created_at
        FROM users u
        WHERE is_verified = 1 " . $filter_sql . "
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
    ";

    // Add LIMIT and OFFSET to params
    $params[] = $limit;
    $params[] = $offset;
    $types .= 'ii';

    $stmt = $conn->prepare($main_sql);
    if ($types !== '') {
        $stmt->bind_param($types, ...$params);
    }

    if (!$stmt->execute()) {
        echo json_encode([
            "status" => "error",
            "message" => "SQL execution error"
        ]);
        exit;
    }

    $result = $stmt->get_result();

    $users_data = [];
    while ($row = $result->fetch_assoc()) {
        $row['is_active'] = $row['is_active'] == 1 ? true : false;
        $users_data[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "data" => $users_data,
        "pagination" => [
            "total_results" => $total_results,
            "total_pages" => $total_pages,
            "current_page" => $page_num
        ]
    ]);

    $stmt->close();
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized access"
    ]);
}

$conn->close();
?>
