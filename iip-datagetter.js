// global flag so they can't hammer away at the button
var timelineLoading = false;

if (typeof AjaxRequest == 'undefined') alert('AjaxRequest class not found');

var IIP = {  
// Change to match project root directory on host web server
baseUrl: '/ondeck/',
mimeType: 'application/json',
responseDelimiter: '',  // '--STARTDATA--',

evaluate: function(response) // John + Steve's code to process JSON response
{
  var startLocation = response.indexOf(IIP.responseDelimiter);
  
  // if the data never started we have no response to process
  if (startLocation < 0){
      throw new Error('No response found, server responded with: ' + response);
  }  
  var startDataLocation = startLocation + IIP.responseDelimiter.length;
  
  // if there was something before the start of the data, alert on it
  if (startLocation > 0) {
    IIP.warningHandler('Additional data in server response: ' +
                                response.substring(0, startLocation)); 
  }  
  // before eval-ing, trim anything before the start of the actual data
  return eval('(' + response.substring(startDataLocation) + ')');
},

getProblems: function(service, clientCallback){
  var request = {
    url: IIP.baseUrl + 'ws/problems/service/' + service + '/',
				 
    callback:
      function(response)   {
        if (response.status != 200)
          return IIP.errorHandler('HTTP code: ' + response.status);
        try {
          clientCallback(IIP.evaluate(response.responseText));
          return true;
        }catch (e){
          return IIP.errorHandler(e.message);
        }
      },
      
    method: 'get',
    
    headers:
      {
        'Accept' : IIP.mimeType
      }
  };
  
  IIP.send(request);
},

getRecentProblems: function(service, clientCallback)
{
  var request = {
    url: IIP.baseUrl + 'ws/problems/service/' + service + '/type/recent/',
				 
    callback:
      function(response)
      {
        if (response.status != 200)
          return IIP.errorHandler('HTTP code: ' + response.status);
          
        try
        {
          clientCallback(IIP.evaluate(response.responseText));
          return true;
        }
        catch (e)
        {
          return IIP.errorHandler(e.message);
        }
      },
      
    method: 'get',
    
    headers:
      {
        'Accept' : IIP.mimeType
      }
  };
  
  IIP.send(request);
},

getIncidentStatus: function(service, from, to, clientCallback)
{
	var daterange = '';
	if (from != "" && to != "")
		daterange = '&from=' + from + '&to=' + to;

  var request = {
    url: IIP.baseUrl + 'ws/incident-status.py?service=' + service + daterange,
				 
    callback:
      function(response)
      {
        if (response.status != 200)
          return IIP.errorHandler('HTTP code: ' + response.status);
          
        try
        {
          clientCallback(IIP.evaluate(response.responseText));
          return true;
        }
        catch (e)
        {
          return IIP.errorHandler(e.message);
        }
      },
      
    method: 'get',
    
    headers:
      {
        'Accept' : IIP.mimeType
      }
  };
  
  IIP.send(request);
},

getAllReleases: function(clientCallback)
{
  var request = {
    url: IIP.baseUrl + 'sml/release/' ,
				 
    callback:
      function(response)
      {
        if (response.status != 200)
          return IIP.errorHandler('HTTP code: ' + response.status);
          
        try
        {
          clientCallback(IIP.evaluate(response.responseText));
          return true;
        }
        catch (e)
        {
          return IIP.errorHandler(e.message);
        }
      },
      
    method: 'get',
    
    headers:
      {
        'Accept' : IIP.mimeType
      }
  };  
  IIP.send(request);
},
send: function(request)
{
  var requestor = new AjaxRequest(request);
  requestor.exec();  
},
errorHandler: function(e)
{
  alert('IIP error: ' + e);
  return false;
},
warningHandler: function(e)
{
  alert('IIP warning: ' + e);
},
enumerate: function(object)
{
  if (typeof(object) !== 'object') { return 'not an object'; }
  var result = new Array();
  for (var i in object) { result.push(i); }
  return result.join('\t');
}  
};