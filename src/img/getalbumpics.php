<?
Header("content-type: application/x-javascript");

function returnimages($dirname=".") {
   $pattern="\.(jpg|jpeg|png|gif|bmp)$";
   $files = array();
   $curimage=0;
   if($handle = opendir($dirname)) {
       while(false !== ($file = readdir($handle))){
               if(eregi($pattern, $file)){
		 $filedate=date ("M d, Y H:i:s", filemtime($file));
                 echo "		[$curimage, \"$file\", \"$filedate\"],\n";
                 $curimage++;
               }
       }
       echo "		[\"placeholder\"]\n";
       closedir($handle);
   }
   return($files);
}

$photovar=$_GET['id'];
if (!eregi("^[a-zA-Z0-9_]+$", $photovar)){
	echo "alert(\"Photo Album ID must contain only letters, numbers, or underscore, and cannot start with a number\")";
	die();
}
echo "var $photovar={\n";
echo "	baseurl: \"http://" . $_SERVER["SERVER_NAME"] . dirname($_SERVER['PHP_SELF']) . "/\",\n";
echo "	images: [\n";
returnimages();
echo "	],\n";
echo "	desc: []\n";
echo "}\n";
?> 
