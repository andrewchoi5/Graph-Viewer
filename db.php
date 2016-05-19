<?php
$dy = date('Y'); //2015
$dm = date('m', strtotime(date('Y-m'))); //06
$dmMinus = date('m', strtotime(date('Y-m')." -1 month")); //05
$dmPlus = date('m', strtotime(date('Y-m')." +1 month")); //07
$dmString = date('F', strtotime(date('Y-m'))); //June
$dmStringMinus = date('F', strtotime(date('Y-m')." -1 month")); //May
$dmStringPlus = date('F', strtotime(date('Y-m')." +1 month")); //July
$dd = date('d'); //17
$ddMinus = date('d', strtotime(date('Y-m-d')." -1 day"));
$ddPlus = date('d', strtotime(date('Y-m-d')." +1 day"));
$dA = date('A');
$dH = date('H');
$di = date('i');
$ds = date('s');
$du = date('u');

$myServer = 'SQL63CNC\G1';
// $myServer = 'SQL51YKF\HA6';

$myUser = 'ebcmipq';
// $slash = '\';
// $myPass ='oA>97&mY$L5y6nH\'w}4B|2Rf0';
$myPass = 'oA>97mY$L5y6nH\w}4B|2Rf0';
$myDB = 'JRDB';
// $myDB = 'locutus';

$dbhandle = mssql_connect($myServer, $myUser, $myPass);
// or die("You have failed connect to the Microsoft SQL Server on <b>$myServer</b>.");
?>