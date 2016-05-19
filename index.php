<!--~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  BlackBerry Compliance Tab (GS): PCI SOX QMS Internal Web App (go/compliance)
                                   Andrew Choi (Service Tools Developer) July 2015
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~-->
<?php require_once('navbar.php');require_once('db.php');
$managers = array("jglassford","shiksharma","bjackson","wrussell","dkehoe","sjenereaux","andrchoi");
if(!(in_array($currentUser,$managers)))Header("Location: http://ciokmp001cnc/gtsscrum/"); ?>
<!DOCTYPE html>
<HTML lang="en">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="description" content="">
	<meta name="author" content="">
	<title>Compliance Tab - GS</title>

	<link  href="favicon.ico" rel="icon">
	<link href="font-awesome-4.3.0/css/font-awesome.min.css" rel="stylesheet" >	
	<link href="bootstrap.min.css" rel="stylesheet">
	<link href="jquery.ui.theme.css" rel="stylesheet">
	<link href="styles.css" rel="stylesheet" type="text/css"/>
	
	<script src="jquery-2.0.3.min.js"></script>
	<script src="jquery-ui.js"></script>
	<script src="bootstrap.min.js"></script><!-- Always put jquery.js BEFORE bootstrap.js  -->
	<script src="highcharts.js"></script>
	<script src="underscore-min.js"></script>
	<script src="d3.min.js"></script>
	<script src="ajax-request.js"></script>
	<script src="iip-datagetter.js"></script>
	<script src="iipcharts.js"></script> <!-- actual data -->	
	<script src="Highcharts-4.1.7/js/highcharts.js"></script>
	<script src="Highcharts-4.1.7/js/modules/data.js"></script>
	<script src="Highcharts-4.1.7/js/modules/exporting.js"></script>
</head>
<body>
	<div class="container">
		<h2>BlackBerry Compliance: PCI, SOX, QMS, Internal</h2>
		<h4><i class="fa fa-bell"></i> Still Under Construction!</h4>
		<h6>Please consider it beta --> Andrew Choi & Will Russell</h6><br>
		<div class="alert alert-dismissable alert-info">
			<button type="button" class="close" data-dismiss="alert">&times;</button>
			<h4>Welcome Back to the Compliance Tab, <?php echo $currentUser;?>!</h4>
			<p>You have arrived at the new Compliance Tab interface, but this area is still under construction so consider it beta.</p>
		</div>
<?php
	$sql='SELECT UpdatedDate,CreatedDate,ResolutionDate,
	CAST(Project AS TEXT) AS Project, 
	CAST(Reporter AS TEXT) AS Reporter, 
	CAST(Assignee AS TEXT)AS Assignee,
	CAST(IssueType AS TEXT)AS IssueType,
	CAST(BusinessRequirement AS TEXT) AS BusinessRequirement, 
	CAST(IssueStatus AS TEXT)AS IssueStatus,
	CAST(ProjectAdmin AS TEXT)AS ProjectAdmin,
	CAST(AccountablePerson AS TEXT)AS AccountablePerson,
	CAST(Summary AS TEXT)AS Summary,
	CAST(Description AS TEXT)AS Description,
	CAST(Priority AS TEXT)AS Priority
	FROM [JRDB].[FCT].[vCompliance]ORDER BY([ID])DESC';
	$query = mssql_query($sql);
	$pciTable = "";
	$pciStoryTable = "";
	$pciClosed = "";
	$pciCnt1 = 0;
	$pciCnt2 = 0;
	$pciCnt3 = 0;
	$people = array("sjenereaux","wrussell");
	$accountablesList = "[";
	$cntSet1 = "[8,";	
	$cntSet2 = "[6,";	
	$cntSet3 = "[7,";	

	while($row = mssql_fetch_array($query)){				
		$date1 = $row['CreatedDate'];
		$date2 = $dy.$dm.$dd;
		$diff = abs(strtotime($date2) - strtotime($date1));
		$years = floor($diff / (365*60*60*24));
		$months = floor(($diff - $years * 365*60*60*24) / (30*60*60*24));
		$days = floor(($diff - $years * 365*60*60*24 - $months*30*60*60*24) / (60*60*24));
	
		// printf("%d years, %d months, %d days\n", $years, $months, $days);		
		if($years == 0 && $months <= 1 && $days <= 30 && $row['IssueType'] == "Epic" && $row['IssueStatus'] == "Open"){
			$pciStoryTable .= '<tr><td>'.
			$row['Summary'].'</td><td>'.
			$row['BusinessRequirement'].'</td><td>'.
			$row['Assignee'].'</td><td>'.
			$row['IssueStatus'].'</td><td>'.
			$row['CreatedDate'].'</td><td>'.
			$row['AccountablePerson'].'</td></tr>';
		}





		$date3 = $row['ResolutionDate'];
		$date4 = $dy.$dm.$dd;
		$ResDiff = abs(strtotime($date4) - strtotime($date3));
		$ResYears = floor($ResDiff / (365*60*60*24));
		$ResMonths = floor(($ResDiff - $ResYears * 365*60*60*24) / (30*60*60*24));
		$ResolutionDaysDiff = floor(($ResDiff - $ResYears * 365*60*60*24 - $ResMonths*30*60*60*24) / (60*60*24));
		if($years == 0 && $months <= 1 && $days <= 30 && $row['IssueType'] == "Epic" && $row['IssueStatus'] == "Open"){
			$pciClosed .= '<tr><td>'.
			$row['Summary'].'</td><td>'.
			$row['BusinessRequirement'].'</td><td>'.
			$row['Assignee'].'</td><td>'.
			$row['ResolutionDate'].'</td><td>'.
			$row['AccountablePerson'].'</td></tr>';
		}

		
						



		if(!(in_array($row['Assignee'],$people)) && ($row['Assignee']) != NULL){
			array_push($people, $row['Assignee']);
		}			
		if($row['IssueStatus'] == 'Open' && $row['IssueType'] == 'Epic'){ 
			foreach($people as $keyA=>$person){
				if($row['Assignee'] == $person){

					if($years < 1 && $row['IssueType'] == "Epic" && $row['IssueStatus'] == "Open"){

						if(isset($pciCnt1Array[$keyA]) != false){
							$pciCnt1Array[$keyA]++;
						}else{
							$pciCnt1Array[$keyA] = 1;
						}
					}

					if(($years >= 1 && $years <= 2) && $row['IssueType'] == "Epic" && $row['IssueStatus'] == "Open"){

						if(isset($pciCnt2Array[$keyA]) != false){
							$pciCnt2Array[$keyA]++;
						}else{
							$pciCnt2Array[$keyA] = 1;
						}
					}
					if($years > 2 && $row['IssueType'] == "Epic" && $row['IssueStatus'] == "Open"){

						if(isset($pciCnt3Array[$keyA]) != false){
							$pciCnt3Array[$keyA]++;
						}else{
							$pciCnt3Array[$keyA] = 1;
						}
					}

				}
			}	
			$pciTable .= '<tr><td>'
			.$row['Summary'].'</td><td>'
			.$row['BusinessRequirement'].'</td><td>'
			.$row['Assignee'].'</td><td>'
			.$row['IssueStatus'].'</td><td>'
			.$row['UpdatedDate'].'</td><td>'
			.$row['AccountablePerson'].'</td></tr>';
		} // end of the third section

	




	} // end of while loop for query
	$cntSet1 .= "".$pciCnt1.",";	
	$cntSet2 .= "".$pciCnt2.",";	
	$cntSet3 .= "".$pciCnt3.",";	
	$cntSet1 .= "]";
	$cntSet2 .= "]";
	$cntSet3 .= "]";
	$accountablesList .= "]";
?>
	</div>
	<div class="container">
<div id="blah" style="min-width: 310px; height: 400px; margin: 0 auto"></div>
<?php foreach($people as $value) echo "<strong>"."$value "."</strong>";?>
<h3><i class='fa fa-tag'> </i> PCI Summary</b></h3>
		<h4><i class='fa fa-list'></i>&nbsp; Summary Table | Open Findings / Stories created within the Past 30 days:</h4>
	<table class='table table-striped table-bordered table-condensed problems'>
	<thead>
		<tr>
		<th><i class='fa fa-paperclip'></i> Summary</th>
		<th><i class='fa fa-fax'></i> Requirements</th>
		<th><i class='fa fa-user-plus'></i> Assignee</th>
		<th><i class='fa fa-mercury'></i> Issue Status</th>
		<th><i class='fa fa-calendar'></i> Date Created</th>
		<th><i class='fa fa-male'></i> Accountability</th></tr>
	</thead>
	<tbody><tr></tr>
	<?php echo $pciStoryTable ?>
	   </tbody></table>


<h4><i class='fa fa-check'></i> PCI Controls addressed / resolved within the Past 30 Days </h4>  
  <table class='table table-striped table-bordered table-condensed problems'>
		<thead><tr><th width='16.67%'>
			<i class='fa fa-paperclip'></i> Summary</th>
			<th width='16.67%'>
			<i class='fa fa-fax'></i> Requirements</th>
		<th width='33.34%'>
			<i class='fa fa-user-plus'></i> Assignee</th>
			<th width='16.67%'><i class='fa fa-calendar'></i> Resolved Date</th>
		<th width='16.67%'><i class='fa fa-male'></i> Accountability</th></tr>
		</thead>
		<tbody><tr>
		<td><b>Summary (or similar field) on compliance issue in JIRA with component = PCI, and a linked issue with a status != closed</b></td>
		<td><b>Summary field on the JIRA issue linked to the control issue as Resolves</b></td><td ><b>Full name of Assignee on action issue </b></td>
		<td><b>Date pulled from Resolved Date field on action issue</b></td><td><b>Full name of Accountable Person field on action issue.</b></td>		
	   </tr>
	   <?php echo $pciClosed ?>
	</tbody></table>

 <h4><b><i class='fa fa-globe'></i>  Open PCI Controls </b></h4><table class='table table-striped table-bordered table-condensed problems'><thead><tr>
 	<th><i class='fa fa-paperclip'></i> Summary</th>
	<th><i class='fa fa-fax'></i> Requirement</th>
	<th><i class='fa fa-user-plus'></i> Assignee</th>
	<th><i class='fa fa-mercury'></i> Status</th>
	<th><i class='fa fa-calendar'></i> Updated Date</th>
	<th><i class='fa fa-male'></i> Accountability</th></tr></thead><tbody><tr>
	<td><strong>Summary (or similar field) on compliance issue in JIRA with component = PCI, and a linked issue with a status != closed </td>
	<td><strong>Summary field on the JIRA issue linked to the control issue as Resolves</td>
	<td><strong>Full name of Assignee on action issue </td>
	<td><strong>Status of action issue (e.g. Open, Selected, In Progress)</td>
	<td><strong>Date pulled from action issue</td>
	<td><strong>Full name of Accountable Person field on action issue</td></tr>	
	<?php echo $pciTable ?> 
  </tbody></table><br><br>









<h3><i class='fa fa-tag'> </i> SOX Summary</b></h3>
		<h4><i class='fa fa-list'></i>&nbsp; Summary Table | Open Findings / Stories created within the Past 30 days:</h4>
	<table class='table table-striped table-bordered table-condensed problems'>
	<thead>
		<tr>
		<th><i class='fa fa-paperclip'></i> Summary</th>
		<th><i class='fa fa-fax'></i> Requirements</th>
		<th><i class='fa fa-user-plus'></i> Assignee</th>
		<th><i class='fa fa-mercury'></i> Issue Status</th>
		<th><i class='fa fa-calendar'></i> Date Created</th>
		<th><i class='fa fa-male'></i> Accountability</th></tr>
	</thead>
	<tbody><tr></tr> 
		<!-- put data here -->
	   </tbody></table>
	   <h4><i class='fa fa-check'></i> SOX Controls addressed / resolved within the Past 30 Days </h4>  
  <table class='table table-striped table-bordered table-condensed problems'>
		<thead><tr><th width='16.67%'>
			<i class='fa fa-paperclip'></i> Summary</th>
			<th width='16.67%'>
			<i class='fa fa-fax'></i> Requirements</th>
		<th width='33.34%'>
			<i class='fa fa-user-plus'></i> Assignee</th>
			<th width='16.67%'><i class='fa fa-calendar'></i> Resolved Date</th>
		<th width='16.67%'><i class='fa fa-male'></i> Accountability</th></tr>
		</thead>
		<tbody><tr>
		<td><b>Summary (or similar field) on compliance issue in JIRA with component = SOX, and a linked issue with a status != closed</b></td>
		<td><b>Summary field on the JIRA issue linked to the control issue as Resolves</b></td><td ><b>Full name of Assignee on action issue </b></td>
		<td><b>Date pulled from Resolved Date field on action issue</b></td><td><b>Full name of Accountable Person field on action issue.</b></td>		
	   </tr>
		<!-- put data here -->
	</tbody></table>
 <h4><b><i class='fa fa-globe'></i>  Open SOX Controls </b></h4><table class='table table-striped table-bordered table-condensed problems'><thead><tr>
 	<th><i class='fa fa-paperclip'></i> Summary</th>
	<th><i class='fa fa-fax'></i> Requirement</th>
	<th><i class='fa fa-user-plus'></i> Assignee</th>
	<th><i class='fa fa-mercury'></i> Status</th>
	<th><i class='fa fa-calendar'></i> Updated Date</th>
	<th><i class='fa fa-male'></i> Accountability</th></tr></thead><tbody><tr>
	<td><strong>Summary (or similar field) on compliance issue in JIRA with component = SOX, and a linked issue with a status != closed </td>
	<td><strong>Summary field on the JIRA issue linked to the control issue as Resolves</td>
	<td><strong>Full name of Assignee on action issue </td>
	<td><strong>Status of action issue (e.g. Open, Selected, In Progress)</td>
	<td><strong>Date pulled from action issue</td>
	<td><strong>Full name of Accountable Person field on action issue</td></tr>	
	<!-- put data here -->
  </tbody></table><br><br>












<h3><i class='fa fa-tag'> </i> QMS Summary</b></h3>
		<h4><i class='fa fa-list'></i>&nbsp; Summary Table | Open Findings / Stories created within the Past 30 days:</h4>
	<table class='table table-striped table-bordered table-condensed problems'>
	<thead>
		<tr>
		<th><i class='fa fa-paperclip'></i> Summary</th>
		<th><i class='fa fa-fax'></i> Requirements</th>
		<th><i class='fa fa-user-plus'></i> Assignee</th>
		<th><i class='fa fa-mercury'></i> Issue Status</th>
		<th><i class='fa fa-calendar'></i> Date Created</th>
		<th><i class='fa fa-male'></i> Accountability</th></tr>
	</thead>
	<tbody><tr></tr>
	<!-- put data here -->
	   </tbody></table>
	   <h4><i class='fa fa-check'></i> QMS Controls addressed / resolved within the Past 30 Days </h4>  
  <table class='table table-striped table-bordered table-condensed problems'>
		<thead><tr><th width='16.67%'>
			<i class='fa fa-paperclip'></i> Summary</th>
			<th width='16.67%'>
			<i class='fa fa-fax'></i> Requirements</th>
		<th width='33.34%'>
			<i class='fa fa-user-plus'></i> Assignee</th>
			<th width='16.67%'><i class='fa fa-calendar'></i> Resolved Date</th>
		<th width='16.67%'><i class='fa fa-male'></i> Accountability</th></tr>
		</thead>
		<tbody><tr>
		<td><b>Summary (or similar field) on compliance issue in JIRA with component = QMS, and a linked issue with a status != closed</b></td>
		<td><b>Summary field on the JIRA issue linked to the control issue as Resolves</b></td><td ><b>Full name of Assignee on action issue </b></td>
		<td><b>Date pulled from Resolved Date field on action issue</b></td><td><b>Full name of Accountable Person field on action issue.</b></td>		
	   </tr>
	   <!-- put data here -->
	</tbody></table>
 <h4><b><i class='fa fa-globe'></i>  Open QMS Controls </b></h4><table class='table table-striped table-bordered table-condensed problems'><thead><tr>
 	<th><i class='fa fa-paperclip'></i> Summary</th>
	<th><i class='fa fa-fax'></i> Requirement</th>
	<th><i class='fa fa-user-plus'></i> Assignee</th>
	<th><i class='fa fa-mercury'></i> Status</th>
	<th><i class='fa fa-calendar'></i> Updated Date</th>
	<th><i class='fa fa-male'></i> Accountability</th></tr></thead><tbody><tr>
	<td><strong>Summary (or similar field) on compliance issue in JIRA with component = QMS, and a linked issue with a status != closed </td>
	<td><strong>Summary field on the JIRA issue linked to the control issue as Resolves</td>
	<td><strong>Full name of Assignee on action issue </td>
	<td><strong>Status of action issue (e.g. Open, Selected, In Progress)</td>
	<td><strong>Date pulled from action issue</td>
	<td><strong>Full name of Accountable Person field on action issue</td></tr>	
	<!-- put data here --> 
  </tbody></table><br><br>









  <h3><i class='fa fa-tag'> </i> Internal Summary</b></h3>
		<h4><i class='fa fa-list'></i>&nbsp; Summary Table | Open Findings / Stories created within the Past 30 days:</h4>
	<table class='table table-striped table-bordered table-condensed problems'>
	<thead>
		<tr>
		<th><i class='fa fa-paperclip'></i> Summary</th>
		<th><i class='fa fa-fax'></i> Requirements</th>
		<th><i class='fa fa-user-plus'></i> Assignee</th>
		<th><i class='fa fa-mercury'></i> Issue Status</th>
		<th><i class='fa fa-calendar'></i> Date Created</th>
		<th><i class='fa fa-male'></i> Accountability</th></tr>
	</thead>
	<tbody><tr></tr>
	<!-- put data here -->
	   </tbody></table>
	   <h4><i class='fa fa-check'></i> Internal Controls addressed / resolved within the Past 30 Days </h4>  
  <table class='table table-striped table-bordered table-condensed problems'>
		<thead><tr><th width='16.67%'>
			<i class='fa fa-paperclip'></i> Summary</th>
			<th width='16.67%'>
			<i class='fa fa-fax'></i> Requirements</th>
		<th width='33.34%'>
			<i class='fa fa-user-plus'></i> Assignee</th>
			<th width='16.67%'><i class='fa fa-calendar'></i> Resolved Date</th>
		<th width='16.67%'><i class='fa fa-male'></i> Accountability</th></tr>
		</thead>
		<tbody><tr>
		<td><b>Summary (or similar field) on compliance issue in JIRA with component = Internal, and a linked issue with a status != closed</b></td>
		<td><b>Summary field on the JIRA issue linked to the control issue as Resolves</b></td><td ><b>Full name of Assignee on action issue </b></td>
		<td><b>Date pulled from Resolved Date field on action issue</b></td><td><b>Full name of Accountable Person field on action issue.</b></td>		
	   </tr>
	   <!-- put data here -->
	</tbody></table>
 <h4><b><i class='fa fa-globe'></i>  Open Internal Controls </b></h4><table class='table table-striped table-bordered table-condensed problems'><thead><tr>
 	<th><i class='fa fa-paperclip'></i> Summary</th>
	<th><i class='fa fa-fax'></i> Requirement</th>
	<th><i class='fa fa-user-plus'></i> Assignee</th>
	<th><i class='fa fa-mercury'></i> Status</th>
	<th><i class='fa fa-calendar'></i> Updated Date</th>
	<th><i class='fa fa-male'></i> Accountability</th></tr></thead><tbody><tr>
	<td><strong>Summary (or similar field) on compliance issue in JIRA with component = Internal, and a linked issue with a status != closed </td>
	<td><strong>Summary field on the JIRA issue linked to the control issue as Resolves</td>
	<td><strong>Full name of Assignee on action issue </td>
	<td><strong>Status of action issue (e.g. Open, Selected, In Progress)</td>
	<td><strong>Date pulled from action issue</td>
	<td><strong>Full name of Accountable Person field on action issue</td></tr>	
	<!-- put data here -->
  </tbody></table>













	<br>	
		<?php
			$internalManagers = array("jglassford","shiksharma","bjackson","wrussell","andrchoi");
			if(!(in_array($currentUser,$internalManagers))) { ?> <script> $('#internal').hide();</script> <?php }
			if(in_array($currentUser, $internalManagers)){
					echo "*Users / managers with access to the Internal Tab: ";
					foreach($internalManagers as $value) echo "<strong>"."$value".", </strong>";
					echo "<br>(Above message is visible to users with access to the Internal tab only).";
			}	
		?>
	</div><!-- End of Container -->
	<br><br><br>
</body>

<script>
$(function(){
    $('#blah').highcharts({
        chart: {type: 'column'},
        title: {text: 'PCI: Number of Controls by Accountables & Age Count'},
        xAxis: {categories: <?php echo $accountablesList ?>},
        yAxis: {
            min: 0,
            title: {
                text: 'Number of Controls'
            },
            stackLabels: {
                enabled: true,
                style: {
                    fontWeight: 'bold',
                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                }
            }
        },
        legend: {
            align: 'right',
            x: -30,
            verticalAlign: 'top',
            y: 25,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
            borderColor: '#CCC',
            borderWidth: 2,
            shadow: true
        },
        tooltip: {
            formatter: function () {
                return '<b>' + this.x + '</b><br/>' +
                    this.series.name + ': ' + this.y + '<br/>' +
                    'Total: ' + this.point.stackTotal;
            }
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true,
                    color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'black',
                    // style: { textShadow: '0 0 3px black' },
                }
            }
        },
        series: [{
            name: 'Less than 1 Year',
            data: <?php echo $cntSet1; ?>,
            color: '#5D98E2',
            borderColor: '#000000',
            borderWidth: 0.5,
            shadow: false
        }, {
            name: '1-2 Years Old',
            data: <?php echo $cntSet2; ?>,
            color: 'orange',
            borderColor: '#000000',
            borderWidth: 0.5,
            shadow: false

        }, {
            name: '2+ Years Old',
            data: <?php echo $cntSet3; ?>,
            color: '#FF5040',
            borderColor: '#000000',
            borderWidth: 0.5,
            shadow: false

        }]
    });
});
</script>
</html>