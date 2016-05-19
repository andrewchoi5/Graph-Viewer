<?php require_once('db.php');?>

<?php

	$sql='SELECT CAST(BusinessRequirement AS TEXT) AS BusinessRequirement FROM [JRDB].[FCT].[vCompliance] ORDER BY ([ID]) DESC';
	$query = mssql_query($sql);
	while($row = mssql_fetch_array($query))	{
		echo '<tr><td>'.$row['BusinessRequirement'].'</td></tr>'; 
	}
	?>