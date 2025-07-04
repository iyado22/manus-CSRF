<?php 

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/PHPMailer-master/PHPMailer.php';
require __DIR__ . '/PHPMailer-master/SMTP.php';
require __DIR__ . '/PHPMailer-master/Exception.php';


function send_verification_email($to_email, $to_name, $code, $type) {
    $mail = new PHPMailer(true);

    try {
        // SMTP server configuration
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'noor.alshams.system@gmail.com';         // My Gmail
        $mail->Password   = 'wlfnlmaeihviohgk';     // My Gmail app password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // Email content
        $mail->setFrom('noor.alshams.system@gmail.com', 'Noor Al-Shams');
        $mail->addAddress($to_email, $to_name);
        $mail->isHTML(true);
        $mail->Subject = 'Your Verification Code';
         if ($type === 'register') {
            $mail->Body = "Hi <b>$to_name</b>,<br><br>Your verification code is: <b>$code</b><br><br>Please enter this code to complete your registration.";
        } else if ($type === 'forgot') {
            $mail->Body = "Hi <b>$to_name</b>,<br><br>Your password reset verification code is: <b>$code</b><br><brPlease enter this code to reset your password.";
        }

        $mail->send();
        return true;

    } catch (Exception $e) {
        echo "Mailer Error: " . $mail->ErrorInfo;
        return false;
    }
    
}


?>