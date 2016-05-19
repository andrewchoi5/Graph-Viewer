var incidentStatusData;
var problemData;
var problemDataSummary = {reactive : {'Awaiting Problem Analysis' : {total : 0, gmps : 0}, 'Open - Problem Planning' : {total : 0, gmps : 0}, 'Open - Awaiting Commitment' : {total : 0, gmps : 0}, 'Open - Committed' : {total : 0, gmps : 0}}, proactive : { open : 0, created : 0, closed : 0}};
var recentProblemData;
var releases;
var ganttReleases = {};
var DATA;
var sorter = 'plannedStart';
var statusTypes = {
	'Awaiting Problem Analysis' : {states : ['Unknown', 'Post Incident', 'BackLog', 'Problem Investigation'], color : '#EFEFEF', filter: true},
	'Open - Problem Planning' : {states : ['Problem Planning'], color : '#A1A1A1', filter: true},
	'Open - Awaiting Commitment' : {states : ['Problem Resolution'], color : '#FF5040', filter: true},
	'Open - Committed' : {states : [], color : '#FFA04D', filter: true}
};
if(!Array.prototype.indexOf) 
{
	Array.prototype.indexOf = function(obj, start) {
		for (var i = (start || 0), j = this.length; i < j; i++) {
		if (this[i] === obj) { return i; }
	 }
	 return -1;
	}
}
function setIncidentStatus(json)
{
	// console.log(json);
	incidentStatusData = json;
}
function setReleases(json)
{
	//console.log(json);
	releases = json;
}
function setProblems(json)
{
	// console.log(json);
	problemData = json;
}
function setSummary(product)
{
	var uniqueIncidents = [];
	for (var year in problemData.intervals)
	{
		for (var month in problemData.intervals[year])
		{
			var incidents = problemData.intervals[year][month];
			var problemsCounted = [];
			for (var i in incidents)		
			{
				var incident = incidents[i];
				var gmps = problemData.incidents[incident].gmps[product];
				for (var PROBindex in problemData.incidents[incident].problems)
				{
					var problem = problemData.incidents[incident].problems[PROBindex];
					if (statusTypes['Open - Problem Planning'].states.indexOf(problemData.problems[problem]["problem-status"]) > -1 && !(problemData.problems[problem].duedate))
					{
						//if the incident wasn't added yet
						if (uniqueIncidents.indexOf(incident) < 0)
						{
							uniqueIncidents.push(incident);
							problemDataSummary.reactive['Open - Problem Planning'].total++;
							problemDataSummary.reactive['Open - Problem Planning'].gmps += gmps;
						}
					}		
					//Awaiting Problem Analysis
					else if (statusTypes['Awaiting Problem Analysis'].states.indexOf(problemData.problems[problem]["problem-status"]) > -1 || !problemData.problems[problem]["problem-status"])
					{
						//if the incident wasn't added yet
						if (uniqueIncidents.indexOf(incident) < 0)
						{
							uniqueIncidents.push(incident);							
							problemDataSummary.reactive['Awaiting Problem Analysis'].total++;
							problemDataSummary.reactive['Awaiting Problem Analysis'].gmps += gmps;
						}
					}					
					//Open - Committed
					else if ((problemData.problems[problem]["problem-status"] == 'Problem Resolution' && (problemData.problems[problem].duedate)) ||
									 (problemData.problems[problem]["problem-status"] == 'Problem Planning' && problemData.problems[problem].duedate))
					{
						//if the incident wasn't added yet
						if (uniqueIncidents.indexOf(incident) < 0)
						{
							uniqueIncidents.push(incident);
							problemDataSummary.reactive['Open - Committed'].total++;
							problemDataSummary.reactive['Open - Committed'].gmps += gmps;
						}
					}					
					//Open - Awaiting Commitment
					else if (statusTypes['Open - Awaiting Commitment'].states.indexOf(problemData.problems[problem]["problem-status"]) > -1 && !(problemData.problems[problem].duedate))
					{
						//if the incident wasn't added yet
						if (uniqueIncidents.indexOf(incident) < 0)
						{
							uniqueIncidents.push(incident);							
							problemDataSummary.reactive['Open - Awaiting Commitment'].total++;
							problemDataSummary.reactive['Open - Awaiting Commitment'].gmps += gmps;
						}
					}
				}
			}
		}
	}
	for (var problem in problemData.proactive)
    if (!(problemData.proactive[problem].resolved))
      problemDataSummary.proactive.open++;
}

function drawSummary(product)
{
	var totalopen = 0;
	for (var type in problemDataSummary.reactive)
		totalopen += problemDataSummary.reactive[type].total;

	var html = '<div class="container" id="summaryTitle">Weekly Summary (Within the past 7 days)</div>';
	html += '<table class="table table-striped table-bordered table-condensed">';
	var weekago = sevenDaysAgo();
	var newincidents = 0;
	var newincidentsGMpS = 0;
	for (var incident in problemData.incidents)
	{
		var end = problemData.incidents[incident].end.substring(0,10);
		if (end >= weekago)
		{
			newincidents++;
			newincidentsGMpS += problemData.incidents[incident].gmps[product];
		}			
	}
	newincidentsGMpS =  Math.round(newincidentsGMpS * 1000) / 1000;
	
	//Incidents Addressed
	var recentProblemsObject = determineRecentProblems();
	var addressed = 0;
	var addressedGMpS = 0;
	for (var incident in recentProblemsObject.addressed)
	{
		addressed++;
		addressedGMpS += recentProblemData.incidents[incident].gmps[product];
	}
	addressedGMpS = Math.round(addressedGMpS * 1000) / 1000;
	html += '<tr><td colspan=5 class="reactive">Reactive</td></tr>';
	html += '<tr><td></td><td colspan=4><b>' + totalopen + '</b> incidents are open</td></tr>';
	var row = 1;
	for (var type in statusTypes)
	{
		if (problemDataSummary.reactive[type].total > 0)
		{
			var gmps = Math.round(problemDataSummary.reactive[type].gmps * 1000) / 1000;
			html += '<tr><td class="summaryTotal"></td><td class="summaryTotal"><b>' + problemDataSummary.reactive[type].total + '</b></td><td><i class="fa fa-square" style="color:' + statusTypes[type].color + ';"></i> ' + type + ' [' + gmps + ' GMpS]</td>';
			
			if (row == 1)
				html += '<td class="newIncidents">New Incidents:</td><td><b>' + newincidents + '</b> [' + newincidentsGMpS + ' GMpS]</td>';
				
			if (row == 2)
				html += '<td class="newIncidents">Incidents Addressed:</td><td><b>' + addressed + '</b> [' + addressedGMpS + ' GMpS]</td>';

			if (row > 2)
				html += '<td colspan=2></td>';

			html += '</tr>';			
			row++;
		}
	}
	html += '<tr><td colspan=5 class="reactive">Proactive</td></tr>';
	html += '<tr><td></td><td colspan=2><b>' + problemDataSummary.proactive.open + '</b> open problems are being actioned</td>';
	var proCreated = 0;
	var proClosed = 0;
	for (var problem in recentProblemData.proactive)
	{
		var created = recentProblemData.proactive[problem].created.substring(0,10);
		if (created >= weekago)
			proCreated++;
		
		if (recentProblemData.proactive[problem].resolved)
		{
			var closed = recentProblemData.proactive[problem].resolved.substring(0,10);
			if (closed >= weekago)
				proClosed++;
		}
	}
	html += '<td>Problems Created:</td><td><b>' + proCreated + '</b></td></tr>';
	html += '<tr><td colspan=3></td><td>Problems Closed:</td><td><b>' + proClosed + '</b></td></tr>';
	
	html += '</table>';
	
	$('#summary').html(html).hide().fadeIn();	
}

function setRecentProblems(json)
{
	recentProblemData = json;
}

function createGanttData()
{
	ganttData = [];
	for (var incident in problemData.incidents)
	{
		for (var problemKey in problemData.incidents[incident].problems)
		{
			var problem = problemData.incidents[incident].problems[problemKey];
			if (problemData.problems[problem].duedate)
			{
				var executive = "N/A";
				if (problemData.problems[problem].executive) executive = problemData.problems[problem].executive;
				var record = {projectKey: problem, summary: executive, plannedStart: problemData.incidents[incident].start.substring(0,10), plannedEnd: problemData.problems[problem].duedate.substring(0,10)};
				ganttData.push(record);
			}
		}
	}
	return ganttData;
}

function drawGanttIPP() 
{
	var dataSet = createGanttData();

	$('#gantt-container').html('');
	if(dataSet.length>0) {
			var dataInfo = {};
			for (var datum in dataSet){
				if(_.has(dataSet, datum)){
					var uid = _.uniqueId('a');
					dataSet[datum]['uid'] = uid
					dataInfo[uid] = dataSet[datum];
				}
			}
			DATA ={dt: dataSet}	
			var window_width = 1170;		// Window width
			var projects = dataSet.length; 				// Number of projects
			var toggler = false;						// Toggler
			var bar_height = 20;
			var row_height =  bar_height + 10;
			var vertical_padding = 100;
			var bar_start_offset = 40;
			// var w = window_width - 100;
			var w = window_width - 50;
			var h = projects * row_height + vertical_padding;
			// var paddingLeft = 100;
			var paddingLeft = 50;
			var paddingTop = 10;
			var min = d3.min(dataSet, accessStartDate);
			var max = d3.max(dataSet, accessEndDate);
			
			// var sorter = 'plannedStart';
			sortByDateAsc();

		// Create Gantt Chart in container
			var svg = d3.select("div #gantt-container").append("svg").attr("width", w).attr("height", h);

		// xAxis
			var xScale = d3.time.scale()
				.domain([min,max]).nice()
				.range([paddingLeft, w]);
			var xAxis = d3.svg.axis()
					.scale(xScale)
					.orient("bottom");

		// xLines
			var currentDate = new Date();
			var line = svg.append("g")
				.selectAll("line")
				.data(xScale.ticks(10))
				.enter().append("line")
				.attr("x1", xScale)
				.attr("x2", xScale)
				.attr("y1", paddingTop + 30)
				.attr("y2", h-50)
				.attr("class","line");
			// Today Line
			var today = new Date();
			var dd = today.getDate(); 
			var mm = today.getMonth()+1;
			svg.append("line")
				.attr("x1", xScale(today))
				.attr("x2", xScale(today))
				.attr("stroke-width", 3)
				.attr("y1", paddingTop + 30)
				.attr("y2", h-50)
				.attr("class","today")
				.attr("title","Today's Date: "+today)
				$('.today').tooltip({track: true});							
		// yAxis
			var y = function(i){return i*row_height+paddingTop + bar_start_offset;}
			labelY = function(i){return i * row_height + paddingTop + bar_start_offset + 13;}			
		// Start to paint...		
			// Draw Bar
				var bar = svg.selectAll("rect")
					.data(DATA.dt, function(key){return key.uid})
					.enter().append("rect")
					.attr("y", function(d, i) {return y(i);})
					.attr("x", function(d) { return xScale(getDate(d.plannedStart))} )
					.attr("width", function(d) {return (xScale(getDate(d.plannedEnd)) - xScale(getDate(d.plannedStart))) } )
					.attr("height", function(d) {return bar_height;})
					.attr("class",function(d) {return 'barcolorondeck';})
					.attr("title", function(d){return d.uid})		
				var barWidth;
				var label = svg.selectAll("text")
					.data(DATA.dt, function(key){return key.uid})
					.enter().append("text")
					.attr("x", function(d){
							barWidth = (xScale(getDate(d.plannedEnd)) - xScale(getDate(d.plannedStart)));
							return barWidth > (("["+d.projectKey+"] : "+d.summary).length * 6) ? (xScale(getDate(d.plannedEnd)) - xScale(getDate(d.plannedStart)))/2 + xScale(getDate(d.plannedStart)) : (xScale(getDate(d.plannedEnd)) - xScale(getDate(d.plannedStart))) + xScale(getDate(d.plannedStart)) + 2;
						})
					.attr("class", function(d){
						barWidth = (xScale(getDate(d.plannedEnd)) - xScale(getDate(d.plannedStart)));
						return barWidth > (("["+d.projectKey+"] : "+d.summary).length * 6) ? "long-bar-text more bar-label"  : "short-bar-text more bar-label";
					})
					.attr("y", function(d, i) { return labelY(i); })
					.attr("text-height", row_height)
					.attr("title", function(d){return d.uid})
					.attr("data-key", function(d){return d.projectKey})
					.text(function(d){return '['+d.projectKey+'] : '+d.summary});
				var btmAxis = svg.append("g")
					.attr("transform", "translate(0,"+(h - 50)+")")
					.attr("class", "axis")
					.call(xAxis);
			// Draw Top Axis
				var topAxis = svg.append("g")
					.attr("transform", "translate(0,"+paddingTop+")")
					.attr("class", "axis")
					.call(xAxis);
				$('#gantt-container').tooltip({
					track: true,
					content: function () {
						var tip = '';
						tip += '<span class="tip-title">Start: </span>';
						tip += '<span class="tip-part">' + dataInfo[this.getAttribute("title")]['plannedStart'] + '</span></br>';
						tip += '<span class="tip-title">Due: </span>';
						tip += '<span class="tip-part">' + dataInfo[this.getAttribute("title")]['plannedEnd'] + '</span></br>';
						return tip;
					}			
				});
			// Bind more click
			$('.more').off('click').on("click", function() {
				window.open('https://jira.rim.net/browse/'+$(this).attr('data-key'),'_blank');
			})	
	} else {
		if(loading) {loading.stop(); ShowHideFilters();}
		$('#gantt-container').html('<div class="no-records text-center"><h3>There are no matching change records for the provided criteria!</h3><div><a id="link-filter" href="#">Change your filters up</a></div></div>')
	}

}
function sortByDateAsc(){DATA.dt.sort(function(a, b){return d3.ascending(getDate(a[sorter]), getDate(b[sorter]));})}
		// Date Functions
			function getDate(date) {return new Date(date);}
			function accessStartDate(d) {return getDate(d.plannedStart); }
			function accessEndDate(d) {return getDate(d.plannedEnd); }
function sortByLeader(data)
{
  var leaderMap = {};
  var leaders = [];
  for (var leader in data)
  {
		//need to sort by the last name
		var spaceLocation = leader.indexOf(' ');
		var lastName = leader.substring(spaceLocation+1, leader.length);
		leaderMap[lastName] = leader;
		leaders.push(lastName);
  }
  var sortedProblems = [];
  leaders.sort();

	//must put Awaiting Problem Analysis first and Accountability Not Identified second
  if ('Problem Analysis' in leaderMap) //if it exists in data
    sortedProblems.push(leaderMap['Problem Analysis']);
  if ('Not Identified' in leaderMap)  //if it exists in data
    sortedProblems.push(leaderMap['Not Identified']);

  for (var i in leaders)
	{
		if (leaders[i] == 'Problem Analysis' || leaders[i] == 'Not Identified') //skip because we already added it.
			continue;
		sortedProblems.push(leaderMap[leaders[i]]);
	}
	return sortedProblems;
}

function buildGMPSperLeader(product)
{
		//get compiled data
		var leaderObject = getGMPSperLeaderData(product, problemData);
		
		//build axis
		var xAxis = [];
		var series = [{name : 'GMpS', data : [], color: '#5d98e2'}];
		
		//must sort leaders first
		var sortedLeaders = sortByLeader(leaderObject);
		
		// for (var leader in leaderObject)
		for (var i in sortedLeaders)
		{
			leader = sortedLeaders[i];
			xAxis.push(leader);
			series[0].data.push(leaderObject[leader].gmps);
		}

		//Draw Chart
		$(function () {
				$('#LeaderGMPS').highcharts({
						chart: {
								type: 'column'
						},
						title: {
								text: product + ' Incidents with Open Actions by Leader Accountable',
								margin: 20
						},
						xAxis: {
								categories: xAxis,
								labels: {
										style: {
												// fontWeight: 'bold',
												fontSize: '15px',
												color: 'black'
										}
								},
						},
						yAxis: {
								min: 0,
								title: {
										text: 'GMpS',
										style: {
												fontWeight: 'bold',
												color: '#5d98e2',
												fontSize: '20px'
										}
								},
						},
						plotOptions: {
								series: {
										borderColor: '#303030'
								},
								column: {
										dataLabels: {
												enabled: true,
												color: 'black'
										}
								}
						},
						legend: {
								enabled: false
						},
						
						credits: {
								enabled: false
						},
						
						series: series
				});
		});
}

function getGMPSperLeaderData(product, data)
{
	leaderObject = {};
	for (var incident in data.incidents)
	{
		var gmps = data.incidents[incident].gmps[product];
		for (var problemIndex in data.incidents[incident].problems)
		{
			var problem = data.incidents[incident].problems[problemIndex];
			var leader = data.problems[problem].executive;
			
			//No leader and awaiting problem analysis
			if (!(leader) && (statusTypes['Awaiting Problem Analysis'].states.indexOf(data.problems[problem]["problem-status"]) > -1 || !data.problems[problem]["problem-status"]))
				leader = 'Awaiting Problem Analysis';
				
			//No leader, but not awaiting problem analysis
			else if (!(leader))
				leader = 'Accountability Not Identified';
				
			
			if (!(leader in leaderObject))
				leaderObject[leader] = {gmps: gmps};
			else
				leaderObject[leader].gmps += gmps;
			
			//3 decimals
			leaderObject[leader].gmps = Math.round(leaderObject[leader].gmps * 1000) / 1000;
		}
	}
	return leaderObject;		
}

function sortByDate(data)
{
  var problemMap = {};
  var dates = [];
	for (var problem in data)
  {
    if ('duedate' in data[problem])
    {
			var theDate = data[problem].duedate;
			problemMap[problem] = theDate;
			if (dates.indexOf(theDate) < 0)
				dates.push(theDate);
    }	
  }
  dates.sort();
	
	var sortedProblems = [];
  for (var i in dates)
	{
		var date = dates[i];
		for (index in problemMap)
		{
			if (date == problemMap[index])
			{
				if (sortedProblems.indexOf(index) < 0)
					sortedProblems.push(index);
			}
		}
	}
	return sortedProblems;
}

function sevenDaysAgo()
{
	var d = new Date();
	d.setDate(d.getDate() - 7);
	
	var y = d.getFullYear();
	var m = d.getMonth() + 1;
	if (m < 10)
		m = "0" + m;
	var day = d.getDate();
	if (day < 10)
		day = "0" + day;

	d = y + "-" + m + "-" + day;
	return d;
}

function determineRecentProblems()
{
	var recentProblemsObject = {addressed : {}, completed : {}}
	var recentProblems = []; //any problem closed within the week.
	var weekago = sevenDaysAgo();
	for (problem in recentProblemData.problems)
	{
		if (recentProblemData.problems[problem].resolved)
		{
			var resolved = recentProblemData.problems[problem].resolved.substring(0,10);
			if (resolved >= weekago)
				recentProblems.push(problem);
		}
	}
	
	//find matching incidents
	for (var incident in recentProblemData.incidents)
	{
		var incidentMatch = false;
		var allProblemsResolved = true;
		var matchingProblems = [];
		for (var problemIndex in recentProblemData.incidents[incident].problems)
		{
			var problem = recentProblemData.incidents[incident].problems[problemIndex];
			
			//this incident has a problem resolved within the week.
			if (recentProblems.indexOf(problem) > -1)
			{
				incidentMatch = true;
				matchingProblems.push(problem);
			}
			
			//if there is a problem which still isn't resolved for this incident
			if (!(recentProblemData.problems[problem].resolved))
				allProblemsResolved = false;
		}
		if (incidentMatch && allProblemsResolved)
			recentProblemsObject.addressed[incident] = matchingProblems;
		//there is a matching incident and there are still problems open
		else if (incidentMatch && !allProblemsResolved)
			recentProblemsObject.completed[incident] = matchingProblems;
	}
	
	return recentProblemsObject;
}

function getMonthYear(start)
{
	var year = start.substring(0,4);
	var month = start.substring(5,7);
	month = monthToText(month).substring(0,3).toUpperCase();
	
	return month + " " + year;
}

function drawRecentProblems(product)
{
	var recentProblemsObject = determineRecentProblems();
	
	var tablehead = '<table class="table table-striped table-bordered table-condensed problems">';
	tablehead += '<thead><tr>';
	tablehead += '<th class="incmonth">INC Month</th>';
	tablehead += '<th class="incident">Incident</th>';
	tablehead += '<th class="date">End Date</th>';	
	tablehead += '<th class="gmps">GMpS</th>';
	tablehead += '<th class="recentproblemsdescription">INC Description</th>';
	tablehead += '<th class="proactivemanager">Service Manager</th>';
	tablehead += '<th class="keyproactive">Problem ID</th>';
	tablehead += '<th>Summary</th>';
	tablehead += '<th class="accountability">Accountability</th>';
	tablehead += '</tr></thead>';
	tablehead += '<tbody>';
	
	var ctr = 0;
	var htmlAddressed = '<div class="container" id="ganttTitle">Incidents Addressed Within the Past 7 Days</div>';
	htmlAddressed += tablehead;
	for (var incident in recentProblemsObject.addressed)
	{
		var problemCount = recentProblemsObject.addressed[incident].length;
		var rowcount = '';
		if (problemCount > 1) rowcount = ' rowspan="' + problemCount + '"';
		
		var monthYear = getMonthYear(recentProblemData.incidents[incident].start);
		
		var gmps = recentProblemData.incidents[incident].gmps[product];
		gmps = Math.round(gmps * 1000) / 1000;		
		
		htmlAddressed += '<tr>';
		htmlAddressed += '<td' + rowcount + '>' + monthYear + '</td>';
		htmlAddressed += "<td class='incident' " + rowcount + "><a class='jira' href='https://jira.rim.net/browse/" + incident + "' target='_blank'>" + incident + "</a></td>";
		htmlAddressed += '<td' + rowcount + '>' + recentProblemData.incidents[incident].end.substring(0,10); + '</td>';
		htmlAddressed += '<td' + rowcount + '>' + gmps + '</td>';
		var description = '';
		if (recentProblemData.incidents[incident].description) description = recentProblemData.incidents[incident].description;		
		htmlAddressed += '<td' + rowcount + '>' + description + '</td>';		
	
		ctr++;
		for (var probIndex in recentProblemsObject.addressed[incident])
		{
			var problem = recentProblemsObject.addressed[incident][probIndex];
			var serviceManager = '';
			if (recentProblemData.problems[problem].assignee) serviceManager = recentProblemData.problems[problem].assignee;
			htmlAddressed += '<td>' + serviceManager + '</td>';
			htmlAddressed += "<td><a class='jira' href='https://jira.rim.net/browse/" + problem + "' target='_blank'>" + problem + "</a></td>";
			var summary = '';
			if (recentProblemData.problems[problem].summary) summary = recentProblemData.problems[problem].summary;
			htmlAddressed += '<td>' + summary + '</td>';
			var accountable = '';
			if (recentProblemData.problems[problem].executive) accountable = recentProblemData.problems[problem].executive;
			htmlAddressed += '<td>' + accountable + '</td>';
			htmlAddressed += '</tr>';
		}
	}
	//clear html
	if (ctr == 0) htmlAddressed = "";
	var html = htmlAddressed;	
	$('#IncidentsAddressed').html(html).hide().fadeIn();	
	
	var ctr = 0;
	var htmlCompleted = '<div class="container" id="ganttTitle">Problems Completed This Week</div>';
	htmlCompleted += tablehead;
	for (var incident in recentProblemsObject.completed)
	{
		var problemCount = recentProblemsObject.completed[incident].length;
		var rowcount = '';
		if (problemCount > 1) rowcount = ' rowspan="' + problemCount + '"';
		
		var monthYear = getMonthYear(recentProblemData.incidents[incident].start);
		
		var gmps = recentProblemData.incidents[incident].gmps[product];
		gmps = Math.round(gmps * 1000) / 1000;			
		
		htmlCompleted += '<tr>';
		htmlCompleted += '<td' + rowcount + '>' + monthYear + '</td>';
		htmlCompleted += "<td class='incident' " + rowcount + "><a class='jira' href='https://jira.rim.net/browse/" + incident + "' target='_blank'>" + incident + "</a></td>";
		htmlCompleted += '<td' + rowcount + '>' + recentProblemData.incidents[incident].end.substring(0,10); + '</td>';
		htmlCompleted += '<td' + rowcount + '>' + gmps + '</td>';
		var description = '';
		if (recentProblemData.incidents[incident].description) description = recentProblemData.incidents[incident].description;
		htmlCompleted += '<td' + rowcount + '>' + description + '</td>';		
		
		ctr++;
		for (var probIndex in recentProblemsObject.completed[incident])
		{
			var problem = recentProblemsObject.completed[incident][probIndex];
			var serviceManager = '';
			if (recentProblemData.problems[problem].assignee) serviceManager = recentProblemData.problems[problem].assignee;
			htmlCompleted += '<td>' + serviceManager + '</td>';
			htmlCompleted += "<td><a class='jira' href='https://jira.rim.net/browse/" + problem + "' target='_blank'>" + problem + "</a></td>";
			var summary = '';
			if (recentProblemData.problems[problem].summary) summary = recentProblemData.problems[problem].summary;			
			htmlCompleted += '<td>' + summary + '</td>';
			var accountable = '';
			if (recentProblemData.problems[problem].executive) accountable = recentProblemData.problems[problem].executive;			
			htmlCompleted += '<td>' + accountable + '</td>';
			htmlCompleted += '</tr>';
		}
	}
	//clear html if no incidents
	if (ctr == 0) htmlCompleted = "";
	var html = htmlCompleted;	
	$('#ProblemsCompleted').html(html).hide().fadeIn();	
}

function drawProactiveResolved(product)
{
	var html = '<div class="container" id="ganttTitle">Recently Resolved Proactive Problems</div>';
	html += '<table class="table table-striped table-bordered table-condensed problems">';
	html += '<thead><tr>';
	html += '<th class="keyproactive">Problem ID</th>';
	html += '<th class="summary">Summary</th>';
	html += '<th class="proactivemanager">Service Manager</th>';	
	html += '<th>Status</th>';
	html += '<th class="proactivedate">Due Date</th>';
	html += '<th class="proactivedate">Resolved</th>';
	html += '<th class="accountability">Accountability</th>';
	html += '</tr></thead>';
	html += '<tbody>';
	
	var count = 0;
	var sortedProblems = sortByDate(problemData.proactive);
	for (var i in sortedProblems)
	{
		var problem = sortedProblems[i];
		
		//exclude resolved proactive
		if (!(problemData.proactive[problem].resolved))
			continue;
		
		var servicemanager = ''; 
		if (problemData.proactive[problem].assignee) servicemanager = problemData.proactive[problem].assignee;
		var summary = '';
		if (problemData.proactive[problem].summary) summary = problemData.proactive[problem].summary.replace(/\r?\n/g, '<br />');
		var status = '';
		if (problemData.proactive[problem].status) status = problemData.proactive[problem].status.replace(/\r?\n/g, '<br />');
		var duedate = '';
		if (problemData.proactive[problem].duedate) duedate = problemData.proactive[problem].duedate.substring(0,10);
		var resolved = problemData.proactive[problem].resolved.substring(0,10);
		var accountability = '';
		if (problemData.proactive[problem].executive) accountability = problemData.proactive[problem].executive;
		
		//make sure resolved date is within 7 days.
		var weekago = sevenDaysAgo();
		if (resolved < weekago)
			continue;
			
		count++;			
		
		html += '<tr>';
		
		if (problem.indexOf('UNKNOWN-') == 0)
			html += "<td>Awaiting Problem Analysis</td>";
		else
			html += "<td><a class='jira' href='https://jira.rim.net/browse/" + problem + "' target='_blank'>" + problem + "</a></td>";
			
		html += '<td class="proactivesummary">' + summary + '</td>';
		html += '<td>' + servicemanager + '</td>';
		html += '<td>' + status + '</td>';
		html += '<td>' +  duedate + '</td>';
		html += '<td>' +  resolved + '</td>';
		html += '<td>' + accountability + '</td>';
		html += '</tr>';
	}
	
	if (count > 0)
		$('#ResolvedProactive').html(html).hide().fadeIn();	
}

function drawProactive(product)
{
	var html = '<div class="container" id="ganttTitle">Open Proactive Problems</div>';
	html += '<table class="table table-striped table-bordered table-condensed problems">';
	html += '<thead><tr>';
	html += '<th class="keyproactive">Problem ID</th>';
	html += '<th class="summary">Summary</th>';
	html += '<th class="proactivemanager">Service Manager</th>';	
	html += '<th>Status</th>';
	html += '<th class="proactivedate">Due Date</th>';
	html += '<th class="accountability">Accountability</th>';
	html += '</tr></thead>';
	html += '<tbody>';
	
	var count = 0;
	var sortedProblems = sortByDate(problemData.proactive);
	for (var i in sortedProblems)
	{
		var problem = sortedProblems[i];
		
		//exclude resolved proactive
		if (problemData.proactive[problem].resolved)
			continue;
			
		count++;
		
		var servicemanager = ''; 
		if (problemData.proactive[problem].assignee) servicemanager = problemData.proactive[problem].assignee;
		var summary = '';
		if (problemData.proactive[problem].summary) summary = problemData.proactive[problem].summary.replace(/\r?\n/g, '<br />');
		var status = '';
		if (problemData.proactive[problem].status) status = problemData.proactive[problem].status.replace(/\r?\n/g, '<br />');
		var duedate = '';
		if (problemData.proactive[problem].duedate) duedate = problemData.proactive[problem].duedate.substring(0,10);
		var accountability = '';
		if (problemData.proactive[problem].executive) accountability = problemData.proactive[problem].executive;
		
		html += '<tr>';
		
		if (problem.indexOf('UNKNOWN-') == 0)
			html += "<td>Awaiting Problem Analysis</td>";
		else
			html += "<td><a class='jira' href='https://jira.rim.net/browse/" + problem + "' target='_blank'>" + problem + "</a></td>";
			
		html += '<td class="proactivesummary">' + summary + '</td>';
		html += '<td>' + servicemanager + '</td>';
		html += '<td>' + status + '</td>';
		html += '<td>' +  duedate + '</td>';
		html += '<td>' + accountability + '</td>';
		html += '</tr>';
	}
	
	if (count > 0)
		$('#Proactive').html(html).hide().fadeIn();	
}

function drawProblemFilters(product)
{
	var html = '<div class="container" id="problemFilter">';
	for (var type in statusTypes)
	{
		var labelClass = 'problemType';
		if (!statusTypes[type].filter)
			labelClass = 'label-clear';
			
		html += '<span class="label label-default label-hover ' + labelClass + '" onclick="updateFilters(\'' + product + '\', \'' + type + '\');"><i class="fa fa-square" style="color:' + statusTypes[type].color + ';"></i> ' + type + '</span> &nbsp;';
	}
	html += '</div>';
	return html;	
}

function updateFilters(product, type)
{
	statusTypes[type].filter = !statusTypes[type].filter;
	drawProblems(product);
}

function getSortedGMPS(year, month, product)
{
	incidents = problemData.intervals[year][month];
	
  var gmpsMap = {};
  var gmpss = [];
  for (var i in incidents)
  {
		var incident = incidents[i];
		var gmps = problemData.incidents[incident].gmps[product];
		// gmps = Math.round(gmps * 1000) / 1000;

		gmpsMap[incident] = gmps;
		gmpss.push(gmps);
  }
  gmpss.sort(sortNumber);
	gmpss.reverse();
	
	var sortedGMPS = [];
  for (var index in gmpss) //for each sorted gmps per month/year
	{
		var gmps = gmpss[index];
		for (var incident in gmpsMap) //for each possible incident
		{
			if (gmps == gmpsMap[incident]) //if the gmps matches
			{
				if (sortedGMPS.indexOf(incident) < 0) //if the incident hasn't been pushed yet
				{
					sortedGMPS.push(incident);  //add the incident. this is all here in case there is a duplicate GMpS value across the tickets
				}			
			}
		}
	}
	return sortedGMPS;
}

function sortNumber(a,b) 
{
   return a - b;
}

function drawProblems(product)
{
	var html = '<div class="container" id="ganttTitle">Open Problems</div>';
	
	//filters
	html += drawProblemFilters(product);
	
	var legend = drawLegend();
	var first = true;
	for (var year in problemData.intervals)
	{
		for (var month in problemData.intervals[year])
		{
			var incidentsFound = false;
			
			var monthHTML = "";
			if (first)
				monthHTML += '<h4 style="margin-bottom: 0px; margin-top: 0px;">' + monthToText(month) + ' ' + year + '</h4>';
			else
				monthHTML += '<h4 style="margin-bottom: 0px;">' + monthToText(month) + ' ' + year + '</h4>';
			monthHTML += legend;
			monthHTML += '<table class="table table-striped table-bordered table-condensed problems">';
			monthHTML += '<thead><tr>';
			monthHTML += '<th class="incident">Incident</th>';
			monthHTML += '<th class="date">End Date</th>';
			monthHTML += '<th class="gmps">GMpS</th>';
			monthHTML += '<th class="description">INC Description</th>';
			monthHTML += '<th class="manager">Service Manager</th>';
			monthHTML += '<th class="statusType"></th>';
			monthHTML += '<th class="key">Problem ID</th>';
			monthHTML += '<th class="summary">Summary</th>';
			monthHTML += '<th class="status">Status</th>';
			monthHTML += '<th class="date">Due Date</th>';
			monthHTML += '<th class="accountability">Accountability</th>';
			monthHTML += '</tr></thead>';
			monthHTML += '<tbody>';
			var sortedGMPS = getSortedGMPS(year, month, product);
			for (var INCindex in sortedGMPS)
			{
				var incident = sortedGMPS[INCindex];
				var firstProblem = problemData.incidents[incident].problems[0];
				
				//Open - Problem Planning
				if (statusTypes['Open - Problem Planning'].states.indexOf(problemData.problems[firstProblem]["problem-status"]) > -1 && !(problemData.problems[firstProblem].duedate)
						&& !statusTypes['Open - Problem Planning'].filter)
					continue;
					
				//Awaiting Problem Analysis
				else if ((statusTypes['Awaiting Problem Analysis'].states.indexOf(problemData.problems[firstProblem]["problem-status"]) > -1 || !problemData.problems[firstProblem]["problem-status"])
						&& !statusTypes['Awaiting Problem Analysis'].filter)
					continue;
					
				//Open - Awaiting Commitment
				else if (statusTypes['Open - Awaiting Commitment'].states.indexOf(problemData.problems[firstProblem]["problem-status"]) > -1 && !(problemData.problems[firstProblem].duedate)
						&& !statusTypes['Open - Awaiting Commitment'].filter)
					continue;
					
				//Open - Committed
				else if (((problemData.problems[firstProblem]["problem-status"] == 'Problem Resolution' && (problemData.problems[firstProblem].duedate)) ||
								 (problemData.problems[firstProblem]["problem-status"] == 'Problem Planning' && problemData.problems[firstProblem].duedate)) 
						&& !statusTypes['Open - Committed'].filter)
					continue;
				incidentsFound = true;				
				var gmps = problemData.incidents[incident].gmps[product];
				gmps = Math.round(gmps * 1000) / 1000;
				
				var description = problemData.incidents[incident].description.replace(/\r?\n/g, '<br />');
				var problemCount = problemData.incidents[incident].problems.length;
				var rowcount = '';
				if (problemCount > 1) rowcount = ' rowspan="' + problemCount + '"';
				
				monthHTML += '<tr>';
				
				if (incident.indexOf('INC-') == 0)
					monthHTML += "<td class='incident' " + rowcount + "><a class='jira' href='https://jira.rim.net/browse/" + incident + "' target='_blank'>" + incident + "</a></td>";
				else
					monthHTML += "<td class='incident' " + rowcount + ">" + incident + "</td>";
				var endDate = '';
				if (problemData.incidents[incident].end) endDate = problemData.incidents[incident].end.substring(0,10);
				monthHTML += '<td' + rowcount + '>' + endDate + '</td>';
				monthHTML += '<td' + rowcount + '>' + gmps + '</td>';
				monthHTML += '<td class="description"' + rowcount + '>' + description + '</td>';
				
				var ctr = 0;
				for (var PROBindex in problemData.incidents[incident].problems)
				{
					var problem = problemData.incidents[incident].problems[PROBindex];
					var servicemanager = ''; 
					if (problemData.problems[problem].assignee) servicemanager = problemData.problems[problem].assignee;
					var summary = '';
					if (problemData.problems[problem].summary) summary = problemData.problems[problem].summary.replace(/\r?\n/g, '<br />');
					var status = '';
					if (problemData.problems[problem].status) status = problemData.problems[problem].status.replace(/\r?\n/g, '<br />');
					if (status == '' && statusTypes['Awaiting Problem Analysis'].states.indexOf(problemData.problems[problem]["problem-status"]) > -1)
						status = problemData.problems[problem]["problem-status"];					
					var date = '';
					if (problemData.problems[problem].duedate) date = problemData.problems[problem].duedate.substring(0,10);
					var accountability = '';
					if (problemData.problems[problem].executive) accountability = problemData.problems[problem].executive;
					if (ctr > 0)
						monthHTML += '<tr>';					
					monthHTML += '<td>' + servicemanager + '</td>';
					if (statusTypes['Open - Problem Planning'].states.indexOf(problemData.problems[problem]["problem-status"]) > -1 && !(problemData.problems[problem].duedate))
						monthHTML += '<td><i class="fa fa-square" style="color:' + statusTypes['Open - Problem Planning'].color + ';"></i></td>';
					
					//Awaiting Problem Analysis
					else if (statusTypes['Awaiting Problem Analysis'].states.indexOf(problemData.problems[problem]["problem-status"]) > -1 || !problemData.problems[problem]["problem-status"])
						monthHTML += '<td><i class="fa fa-square" style="color:' + statusTypes['Awaiting Problem Analysis'].color + ';"></i></td>';
					
					//Open - Committed
					else if ((problemData.problems[problem]["problem-status"] == 'Problem Resolution' && (problemData.problems[problem].duedate)) ||
									 (problemData.problems[problem]["problem-status"] == 'Problem Planning' && problemData.problems[problem].duedate))
					{
						monthHTML += '<td><i class="fa fa-square" style="color:' + statusTypes['Open - Committed'].color + ';"></i></td>';						
					}
					
					//Open - Awaiting Commitment
					else if (statusTypes['Open - Awaiting Commitment'].states.indexOf(problemData.problems[problem]["problem-status"]) > -1 && !(problemData.problems[problem].duedate))
						monthHTML += '<td><i class="fa fa-square" style="color:' + statusTypes['Open - Awaiting Commitment'].color + ';"></i></td>';		
						
					else
						monthHTML += '<td><i class="fa fa-square" style="color:white;"></i></td>';					
					if (problem.indexOf('UNKNOWN-') == 0)
						monthHTML += "<td>Awaiting Problem Analysis</td>";
					else
						monthHTML += "<td><a class='jira' href='https://jira.rim.net/browse/" + problem + "' target='_blank'>" + problem + "</a></td>";
						
					monthHTML += '<td class="summary">' + summary + '</td>';
					monthHTML += '<td class="status">' + status + '</td>';
					monthHTML += '<td>' + date + '</td>';
					monthHTML += '<td>' + accountability + '</td>';
					monthHTML += '</tr>';
					ctr++;
				}
			}
			monthHTML += '</tbody></table>';			
			//Only add the month data if there was data.
			if (incidentsFound)
				html += monthHTML
			
			first = false;
		}
	}
	
	$('#Problems').html(html).hide().fadeIn();
}

function drawLegend()
{
	html = '<span style="float: right; font-size: 13px;">';
	for (var type in statusTypes)
	{
		html += '&nbsp;&nbsp;&nbsp;<i class="fa fa-square" style="color:' + statusTypes[type].color + ';"></i> ' + type;
	}
	html += '</span>';
	return html;
}

function buildIncidentStatus(product)
{
	//get xAxis
	var xAxis = getIncidentStatusXAxis(product, incidentStatusData);
	
	//get Series data
	var series = getIncidentStatusSeries(product, incidentStatusData);
	$(function () {
			$('#IncidentStatus').highcharts({
					chart: {
							type: 'column'//,
							//alignTicks: false
					},
					title: {
							text: product + ' Incident Status',
							margin: 50
					},
					xAxis:
					{
							categories: xAxis,
							labels: {
									style: {
											// fontWeight: 'bold',
											fontSize: '15px',
											color: 'black'
									}
							},									
					}
					,					
					yAxis: 				
					{
							min: 0,
							title: {
									text: '# of Incidents',
									style: {
											fontWeight: 'bold',
											color: '#5d98e2',
											fontSize: '20px'
									}										
							},
							//gridLineWidth: 0,
							stackLabels: {
									enabled: true,
									style: {
											fontWeight: 'bold',
											color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
									}
							}
					}					
					,					
					credits: {
							enabled: false
					},						
					
					legend: {
							itemStyle: {
								 fontSize: '15px',
								 color: 'black'
							},							
							align: 'right',
							// x: -65,
							x: 0,
							verticalAlign: 'top',
							y: 40,
							floating: true,
							backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
							borderColor: '#CCC',
							borderWidth: 1,
							shadow: false
					},
					
					tooltip: {
							formatter: function () {
									return '<b>' + this.x + '</b><br/>' +
											this.series.name + ': ' + this.y + '<br/>' +
											'Total: ' + this.point.stackTotal;
							}
					},	
					plotOptions: {
							series: {
									borderColor: '#303030'
							},
							column: {
									stacking: 'normal',
									borderWidth: 1,
									borderColor: 'a1a1a1',
									dataLabels: {
											enabled: true,
											formatter:function(){
													if(this.y > 0)
															return this.y;
											},
											color: 'black',
									},
									
									events: {
												legendItemClick: function () {
														}
												}
										,
										showInLegend: true											
							}						
					},
					
					series: series
			});
	});
}

function getIncidentStatusSeries(product, data)
{
	var series = [
		{name : 'Awaiting Problem Analysis', data : [], color : '#EFEFEF'},
		{name : 'Open - Problem Planning', data : [], color : '#A1A1A1'},
		{name : 'Open - Awaiting Commitment', data : [], color : '#FF5040'},
		{name : 'Open - Committed', data : [], color : '#FFA04D'},
		{name : 'Closed', data : [], color : '#A6C661'}		
		];

	for (var year in data[product])
	{
		for (var month in data[product][year])
		{
			for (var index in series)
			{
				if (series[index].name == 'Awaiting Problem Analysis')
					series[index].data.push(data[product][year][month]['waiting-analysis']);

				if (series[index].name == 'Open - Problem Planning')
					series[index].data.push(data[product][year][month]['open-planning']);

				if (series[index].name == 'Open - Awaiting Commitment')
					series[index].data.push(data[product][year][month]['open-waiting']);

				if (series[index].name == 'Open - Committed')
					series[index].data.push(data[product][year][month]['open-committed']);

				if (series[index].name == 'Closed')
					series[index].data.push(data[product][year][month]['closed']);					
			}
		}
	}
	return series;
}
function getActionCommitmentsXAxis(data)
{
	xAxis = [];
	for (var year in data)
	{
		for (var month in data[year])
		{
			var mon = monthToText(month);
			mon = mon.substring(0,3);
			xAxis.push(mon + ' ' + year);
		}
	}
	return xAxis;
}
function getIncidentStatusXAxis(product, data)
{
	xAxis = [];
	for (var year in data[product])
	{
		for (var month in data[product][year])
		{
			var mon = monthToText(month);
			mon = mon.substring(0,3);
			xAxis.push(mon + ' ' + year);
		}
	}
	return xAxis;
}
function monthToText(month)
{
	if (month==1) return "January";
	if (month==2) return "February";
	if (month==3) return "March";
	if (month==4) return "April";
	if (month==5) return "May";
	if (month==6) return "June";
	if (month==7) return "July";
	if (month==8) return "August";
	if (month==9) return "September";
	if (month==10) return "October";
	if (month==11) return "November";
	if (month==12) return "December";
}
function getParameterByName(name) 
{
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}