<?php
function redirect_to($location)
{
    if (!headers_sent()) {
        header('Location: ' . $location);
        exit;
    } else
        echo '<script type="text/javascript">';
    echo 'window.location.href="' . $location . '";';
    echo '</script>';
    echo '<noscript>';
    echo '<meta http-equiv="refresh" content="0;url=' . $location . '" />';
    echo '</noscript>';
}
// Do not edit this if you are not familiar with php
error_reporting (E_ALL ^ E_NOTICE);
$post = (!empty($_POST)) ? true : false;

$replyto='info@kandamathlodge.com';
$subject = 'Contact Form Results';

if($post)
	{
	function ValidateEmail($email)
	{

$regex = "/([a-z0-9_\.\-]+)". # name

"@". # at

"([a-z0-9\.\-]+){2,255}". # domain & possibly subdomains

"\.". # period

"([a-z]+){2,10}/i"; # domain extension 

$eregi = preg_replace($regex, '', $email);

return empty($eregi) ? true : false;
}

$name = stripslashes($_POST['name']);
$email = trim($_POST['email']);

$message = stripslashes($_POST['subject']);
$text = stripslashes($_POST['text']);
//$answer = trim($_POST['answer']);
//$verificationanswer="6"; // plz change edit your human answer
$from=$email;
$to=$replyto;
$error = '';
$headers= "From: $name <" . $email . "> \n";
$headers.= "Reply-to:" . $email . "\n";
$headers .= 'MIME-Version: 1.0' . "\r\n";
$headers = "Content-Type: text/html; charset=utf-8\n".$headers;

//echo $email.$message.$text;

// Checks Name Field

if(!$name || !$email || $email && !ValidateEmail($email) || !$message || strlen($message) < 1 || !$text || strlen($text) < 1)
{
$error .= 'Please fill the required fields correctly.<br />';
}

if(!$error)
	{
$messages.="Name: $name <br>";
$messages.="Email: $email <br>";
$messages.="Message: $message <br><br><br> $text";

	$mail = mail($to,$subject,$messages,$headers);	

if($mail)
	{
	echo 'OK';
	redirect_to("contact.html");
	
	}

	}
	else
	{
	echo '<div class="error">'.$error.'</div>';
	}

}
?>