/*
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  JavaScript wrapper for XMLHttpRequest object
                                                        W Lockwood January 2012
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

function AjaxRequest(request)
{
  if (!request) throw new Error('no request object specified');
  
  this.requestor = AjaxRequest.getRequestor();

  // extract request parameters
  this.method = (request.method) ? request.method.toUpperCase() : 'GET';
  this.data = (request.data) ? request.data : new Object();
  this.async = (typeof request.async != 'undefined') ? request.async : false;

  this.headers = request.headers &&
                 request.headers.constructor.toString().indexOf('Object') >= 0
                 ? request.headers : new Object();
  
  this.url = (request.url) ? request.url : null;
  if (!this.url) throw new Error('no URL specified');

  this.callback = (request.callback) ? request.callback : null;
  this.user = (request.user) ? request.user : null;
  this.pwrd = (request.password) ? request.password : null;
}

AjaxRequest.prototype.exec = function()
{
  // convert data object in string array representing key-value pairs
  var body = null;
  var kvpairs = AjaxRequest.toAssoc(this.data);
  
  // Add key-value pairs to query string if method is GET or HEAD
  var requestHasBody = this.requestHasBody();

  if (requestHasBody) body = kvpairs.join('&');
  else
  {
    if (kvpairs.length) this.url += ((this.url.indexOf('?') == -1) ? '?' : '&') + kvpairs.join('&');
  }

  // configure rest of XMLHttpRequest object
  this.open();
  
  // must set headers after open() is called; http://www.webmasterworld.com/forum91/4542.htm
  if (requestHasBody) 
  {
    this.requestor.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    //this.requestor.setRequestHeader('Content-length', body.length);      
  }

  // add requested headers, if any
  for (var header in this.headers)
  {
    this.requestor.setRequestHeader(header, this.headers[header]);
  }
  
  var me = this; // Javascript closure
  this.requestor.onreadystatechange = function() { me.handler() };
  
  // execute request
  this.requestor.send(body);
}

AjaxRequest.prototype.requestHasBody = function()
{
  return (this.method == 'GET' || this.method == 'HEAD' || this.method == 'DELETE') == false;
}

AjaxRequest.prototype.open = function()
{
  if (this.user)
    this.requestor.open(this.method, this.url, this.async, this.user, this.pwrd);
  else
    this.requestor.open(this.method, this.url, this.async);
}

AjaxRequest.prototype.handler = function()
{
  if (this.callback && this.requestor.readyState == 4)
    this.callback(this.requestor);
}

AjaxRequest.getRequestor = function()
{
  var activeXVersions = new Array(
    'Msxml2.XMLHTTP.6.0',
    'Msxml2.XMLHTTP.3.0',
    'Msxml2.XMLHTTP',
    'Microsoft.XMLHTTP'
  );

  try
  {
    return new XMLHttpRequest();
  }
  catch (e) // IE6
  {
    for (var i = 0; i < activeXVersions.length; i++)
    {
      try { return new ActiveXObject(activeXVersions[i]);  }
      catch (e) { /* do nothing */ }
    }
  }
  throw new Error('can\'t create XMLHttpRequest object');
}

AjaxRequest.toAssoc = function(data)
{
  if (typeof(data) == 'string') return [data]; // pass through as is
  var kvpairs = new Array();
  
  for (var key in data)
  {
    var value = data[key];
    
    if (value === null)
      kvpairs.push(encodeURIComponent(key) + '=');
    
    // Check if value is an array or object; if so, break down into multiple keys
    else if (value.constructor.toString().indexOf('Array') >= 0
        || value.constructor.toString().indexOf('Object') >= 0)
    {
      for (var item in value)
      {
        kvpairs.push(
          encodeURIComponent(key.replace(/\[\]$/, '')) // remove [] from key name
          + '[]=' +                                    // because we add them here
          encodeURIComponent(value[item])
        );
      }
    }
    else
      kvpairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
  }
  return kvpairs;
}

AjaxRequest.parseForm = function(form)
{
  if (!form) return null;
  source = (arguments.length > 1) ? arguments[1] : false;
  
  // Collect data for POST in object form.
  var post = new Object();
  
  for (var i = 0; i < form.length; i++)
  {
    var elem = form[i];
    if (!elem.name || !elem.value) continue;
    
    switch (elem.type)
    {
      case 'radio':
        if (elem.checked) post[elem.name] = elem.value;
        break;
      
      case 'checkbox':
        if (!elem.checked) continue;
        if (!post[elem.name]) post[elem.name] = new Array();
        post[elem.name].push(elem.value);
        break;
      
      case 'select-multiple':
        if (!elem.options) continue;
        post[elem.name] = new Array();
        for (var j = 0; j < elem.options.length; j++)
          if (elem.options[j].selected) 
            post[elem.name].push(elem.options[j].value);
        break;
      
      case 'submit':
        if (source && elem == source) break; // skip form submit button if specified
      
      default:
        post[elem.name] = elem.value;
    }
  }
  return post;
}