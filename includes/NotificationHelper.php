<?php 

class NotificationHelper {
    // This class can be extended with more notification-related methods in the future

    public static function sendNotification($user_id, $title, $message){
    global $conn;
    // Prepare the SQL statement to insert the notification
    $stmt = $conn->prepare("INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)");
    
    // Bind parameters
    $stmt->bind_param("iss", $user_id, $title, $message);
    // Execute the statement
    if (!$stmt->execute()) {
        // Handle error
        echo json_encode([
            "status" => "error",
            "message" => "Failed to send notification: " . $stmt->error
        ]);
        return false;
    }
    // Close the statement
    $stmt->close();

    $stmt = $conn->prepare("
        DELETE FROM notifications 
        WHERE user_id = ? 
        AND id NOT IN (
            SELECT id FROM (
                SELECT id FROM notifications 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 100
            ) AS keep_ids
        )
    ");
    $stmt->bind_param('ii', $user_id, $user_id);
    $stmt->execute();
    $stmt->close();
}

    public static function sendBookingNotification($user_id, $bookingData){
        switch($bookingData['status']) {
            case 'confirmed':
                $title = "Booking Confirmed";
                $message = "Your booking for " . $bookingData['service_name'] . " on" . $bookingData['date'] . " at" . $bookingData['time'] . " has been confirmed.";
                break;
            case 'cancelled':
                $title = "Booking Cancelled";
                $message = "Your booking for " . $bookingData['service_name'] . " on" . $bookingData['date'] . " at" . $bookingData['time'] . " has been cancelled.";
                break;
            case 'pending':
                $title = "Booking Pending";
                $message = "Your booking for " . $bookingData['service_name'] . " on" . $bookingData['date'] . " at" . $bookingData['time'] . " is under review.";
                break;
            case 'updated':
                $title = "Booking Updated";
                $message = "Your booking for " . $bookingData['service_name'] . " on" . $bookingData['old_date'] . " at" . $bookingData['old_time'] . " has been updated to be on ". $bookingData['new_date'] . " at " . $bookingData['new_time'] . ".";
                break;
            case 'completed':
                $title = "Booking Completed";
                $message = "Your booking for " . $bookingData['service_name'] . " on" . $bookingData['date'] . " at" . $bookingData['time'] . " has been completed.";
                break;
            default:
                return false; // Invalid status
        }

        self::sendNotification($user_id, $title, $message);
    } 

    public static function sendStaffAssignmentNotification($staff_id, $data) {
    $message = "You have been assigned to an appointment on {$data['date']} at {$data['time']}.";
    
    self::sendNotification($staff_id, "New Appointment Assigned", $message);
}


    public static function sendAnnouncementNotification($user_id, $announcementData){
        $title = "New Announcement";
        $message = "New announcement: " . $announcementData['message'];

        self::sendNotification($user_id, $title, $message);
    }

    public static function sendFeedbackNotification($user_id, $feedbackData){
        $title = "New Feedback Received";
        $message = "New feedback from " . $feedbackData['user_name'] . ": " . $feedbackData['comment'];

        self::sendNotification($user_id, $title, $message);
    }

    public static function sendCheckInNotification($staff_id, $checkInData){
        $title = "Check-In Notification";
        $message = "Staff member " . $checkInData['staff_name'] . " has checked-in on " . $checkInData['date']. " at " . $checkInData['time'] . ".";

        self::sendNotification($staff_id, $title, $message);
    }

    public static function sendCheckOutNotification($staff_id, $checkOutData){
        $title = "Check-Out Notification";
        $message = "Staff member " . $checkOutData['staff_name'] . " has checked-out on " . $checkOutData['date']. " at " . $checkOutData['time'] . ".";

        self::sendNotification($staff_id, $title, $message);
    }

    public static function sendMessageNotification($user_id, $messageData){
        $title = "New Message";
        $message = "You have received a new message from " . $messageData['sender_name'] . ": " . $messageData['content'];

        self::sendNotification($user_id, $title, $message);
    }

    public static function notifyAdmins($title, $message)
{
    global $conn;

    $stmt = $conn->prepare("SELECT id FROM users WHERE role = 'admin' AND is_active = 1");
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $admin_id = $row['id'];
        self::sendNotification($admin_id, $title, $message);
    }

    $stmt->close();
}


}

    

?>
