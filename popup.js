// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */

window.onload = function(){
  function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, function(tabs) {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

/**
 * @param {string} searchTerm - Search term for Google Image search.
 * @param {function(string,number,number)} callback - Called when an image has
 *   been found. The callback gets the URL, width and height of the image.
 * @param {function(string)} errorCallback - Called when the image is not found.
 *   The callback gets a string that describes the failure reason.
 */
function getImageUrl(searchTerm, callback, errorCallback) {
  // Google image search - 100 searches per day.
  // https://developers.google.com/image-search/
  var searchUrl = 'https://ajax.googleapis.com/ajax/services/search/images' +
    '?v=1.0&q=' + encodeURIComponent(searchTerm);
  var x = new XMLHttpRequest();
  x.open('GET', searchUrl);
  // The Google image search API responds with JSON, so let Chrome parse it.
  x.responseType = 'json';
  x.onload = function() {
    // Parse and process the response from Google Image Search.
    var response = x.response;
    if (!response || !response.responseData || !response.responseData.results ||
        response.responseData.results.length === 0) {
      errorCallback('No response from Google Image search!');
      return;
    }
    var firstResult = response.responseData.results[0];
    // Take the thumbnail instead of the full image to get an approximately
    // consistent image size.
    var imageUrl = firstResult.tbUrl;
    var width = parseInt(firstResult.tbWidth);
    var height = parseInt(firstResult.tbHeight);
    console.assert(
        typeof imageUrl == 'string' && !isNaN(width) && !isNaN(height),
        'Unexpected respose from the Google Image Search API!');
    callback(imageUrl, width, height);
  };
  x.onerror = function() {
    errorCallback('Network error.');
  };
  x.send();
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url) {
    // Put the image URL in Google search.
    renderStatus('Performing Google Image search for ' + url);

    getImageUrl(url, function(imageUrl, width, height) {

      renderStatus('Search term: ' + url + '\n' +
          'Google image search result: ' + imageUrl);
      var imageResult = document.getElementById('image-result');
      // Explicitly set the width/height to minimize the number of reflows. For
      // a single image, this does not matter, but if you're going to embed
      // multiple external images in your page, then the absence of width/height
      // attributes causes the popup to resize multiple times.
      imageResult.width = width;
      imageResult.height = height;
      imageResult.src = imageUrl;
      imageResult.hidden = false;

    }, function(errorMessage) {
      renderStatus('Cannot display image. ' + errorMessage);
    });
  });
});

// Add bubble to the top of the page.
var bubbleDOM = document.createElement('div');
bubbleDOM.setAttribute('class', 'example-twitter');
bubbleDOM.setAttribute('id', 'example-twitter');
document.body.appendChild(bubbleDOM);
var isWindowOpen = false, click = 0;
var selection;
// Lets listen to mouseup DOM events.
document.addEventListener('mouseup', function (e) {
  click ++;
    selection = window.getSelection().toString();
  console.log(click, selection, isWindowOpen);
  if (selection.length > 0) {
    if(isWindowOpen == false && click >= 1){
      renderBubble(e.clientX, e.clientY, selection);
      isWindowOpen = true;
      console.log('HI');
      click = 0;
    }
  }
    if(isWindowOpen == true && click == 1){
      console.log('HI2');
      click = 0;
      if(e.target != document.getElementById('example-twitter')) {
        bubbleDOM.style.visibility = 'visible';
        isWindowOpen = false;
      }
    }
  
  if(click==2) click = 0;
/*}, false);

// Close the bubble when we click on the screen.
document.addEventListener('click', function (e) {*/
  
    /*console.log(isWindowOpen);
    if(e.target != document.getElementById('example-twitter')) {
        bubbleDOM.style.visibility = 'hidden';
        isWindowOpen = false;
    }*/


document.addEventListener('click', function(e) {
  if (e.target.id == 'WM')
  {
    getWalmart(selection);
  }
});
}, false);

/*function changeIframe(selection){
  console.log(isWindowOpen);
    bubbleDOM.innerHTML = "<a id='blah' href='http://www.stackoverflow.com/?q="+selection+"'></a>";
    isWindowOpen = true;
}*/
/*function changeIframe2(selection){
    console.log(isWindowOpen);
    //var k = "http://duckduckgo.com/?q=!wiki"+selection;
    bubbleDOM.innerHTML = "<a href='https://en.wikipedia.org/' target='_blank'></a>";
    isWindowOpen = true;
}*/
// Move that bubble to the appropriate location.

function renderBubble(mouseX, mouseY, selection) {

  bubbleDOM.innerHTML = "<a href='javascript:history.back()'><input id='BA' type='button' value='<' /></a>";
  bubbleDOM.innerHTML += "<a href='https://stackoverflow.com/?q="+selection+"' target='_blank'><input id='SO' type='button' value='Stack Overflow' /></a>";
  bubbleDOM.innerHTML += "<input id='WM' type='button'  value='Walmart' />";
  bubbleDOM.innerHTML += "<a href='https://en.wikipedia.org/wiki/"+selection+"' target='_blank'><input id='WP' type='button' onClick='changeIframe2()' value='Wikipedia' /></a>";
  bubbleDOM.innerHTML += "<a href='http://www.quora.com/search?q="+selection+"' target='_blank'><input id='QU' type='button' value='Quora' /></a>";
  bubbleDOM.innerHTML += "<a href='http://www.imdb.com/find?q="+selection+"' target='_blank'><input id='IM' type='button' value='IMDB' /></a>";
  bubbleDOM.innerHTML += "<iframe id='blah' src='https://duckduckgo.com/?q="+selection+"'></iframe>";
  

  bubbleDOM.style.top = mouseY + 'px';
  bubbleDOM.style.left = mouseX + 'px';
  bubbleDOM.style.visibility = 'visible';


}

function getWalmart(selection) {
  var link = "http://api.walmartlabs.com/v1/search?apiKey=ztdjzwqqv4mg5ht88h9pe2xt&query=" + selection;
  var data;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      var myArr = JSON.parse(xmlhttp.responseText);
      parseData(myArr);
    }
  }
  xmlhttp.open("GET", link, true);
  xmlhttp.send();

  function parseData(arr) {//WALMART
    var out = " ";
    if (arr.numItems === 0)
    {
      document.getElementById('blah').innerHTML = "<p>No Results.</p>";
    }
    else
    {
    for (i=0; i<arr.numItems; i++)
    {
          
      out += "<div style='margin: 10px 5px; border-bottom: 2px solid black; padding: 5px 0'><div><img src='" + arr.items[i].thumbnailImage + "'/>" + "</div><div>" + arr.items[i].name + "</div><div>Price: $" + arr.items[i].salePrice + '</div><div> Rating : ' + arr.items[i].customerRating + '</div><div><a href="'+ arr.items[i].addToCartUrl + '"><button>Add to cart</button></a></div></div>';
    }
    bubbleDOM.innerHTML = out;
    console.log(out);
    }
    
  }
}



}

