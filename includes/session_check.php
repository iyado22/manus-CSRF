<?php 
session_start(); //Starts the session.
if(!isset($_SESSION['user_id']))          //If there's no user_id set in the session, logs you out. (ends your current session)
{
    header("Location: ../login.php");   
    exit;
}

// if($_SESSION['role']!= 'admin')      //This condition will be used when protecting a certain page for admins. (will do it later)
// {
    
// }


?>