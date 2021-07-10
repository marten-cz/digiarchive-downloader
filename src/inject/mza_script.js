"use strict";

// // Call the below function
// waitForLoaded(function() { setTimeout(initialize, 1000) }, 300, 9000);

// function waitForLoaded(callback, checkFrequencyInMs, timeoutInMs) {
//   var startTimeInMs = Date.now();
//   (function loopSearch() {
//     if (typeof g_viewer !== "undefined" && g_viewer.hasOwnProperty('drawer')) {
//       callback();
//       return;
//     }
//     else {
//       setTimeout(function () {
//         if (timeoutInMs && Date.now() - startTimeInMs > timeoutInMs) {
//           console.log('timeouted');
//           return;
//         }
//         loopSearch();
//       }, checkFrequencyInMs);
//     }
//   })();
// }
initialize();

function initialize() {
  var mzaViewer;
  if (typeof g_viewer !== "undefined") {
    mzaViewer = g_viewer;
  }
  else if (typeof dragon !== "undefined") {
    mzaViewer = dragon;
  }

  function trim(c) {
    var ctx = c.getContext('2d'),
      copy = document.createElement('canvas').getContext('2d'),
      pixels = ctx.getImageData(0, 0, c.width, c.height),
      l = pixels.data.length,
      i,
      bound = {
        top: null,
        left: null,
        right: null,
        bottom: null
      },
      x, y;

    for (i = 0; i < l; i += 4) {
      if (pixels.data[i+3] !== 0) {
        x = (i / 4) % c.width;
        y = ~~((i / 4) / c.width);
    
        if (bound.top === null) {
          bound.top = y;
        }
        
        if (bound.left === null) {
          bound.left = x; 
        } else if (x < bound.left) {
          bound.left = x;
        }
        
        if (bound.right === null) {
          bound.right = x; 
        } else if (bound.right < x) {
          bound.right = x;
        }
        
        if (bound.bottom === null) {
          bound.bottom = y;
        } else if (bound.bottom < y) {
          bound.bottom = y;
        }
      }
    }
      
    var trimHeight = bound.bottom - bound.top,
        trimWidth = bound.right - bound.left,
        trimmed = ctx.getImageData(bound.left, bound.top, trimWidth, trimHeight);
    
    copy.canvas.width = trimWidth;
    copy.canvas.height = trimHeight;
    copy.putImageData(trimmed, 0, 0);
    
    // open new window with trimmed image:
    return copy.canvas;
  }

  function mzaDownload() {
    var ow = $("#openseadragon").css('width');
    var oh = $("#openseadragon").css('height');
    $("#openseadragon").attr("style", "text-align: center; height: " + 
      (mzaViewer.world.getItemAt(0).source.dimensions.y / 
      window.devicePixelRatio) + "px;" + "width: " + 
      (mzaViewer.world.getItemAt(0).source.dimensions.x / 
      window.devicePixelRatio) + "px");
    mzaViewer.viewport.panTo(mzaViewer.viewport.getCenter(), true);

    var type = prompt("Type of archive (N / O / Z)", "");
    var year = prompt("Please enter year", "");
    var person = prompt("Please enter name of the person(s)", "");
    var place = prompt("Please enter name of the place", $('main[role="main"] .card:eq(0) .row:eq(1) .col-12:eq(2) strong').text());
    var book = $('main[role="main"] .card:eq(0) .row:eq(0) .col-12:eq(0) strong').text();
    var page = $("#input-page").val();

    setTimeout(function () {
      var img = trim(mzaViewer.drawer.canvas).toDataURL("image/png");

      var element = document.createElement('a');
      element.setAttribute('href', img);
      var filename = `${type} ${year} - ${person} - ${place} - ${book} pg ${page}`;
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);

      $("#openseadragon").attr("style", `width: ${ow}; height: ${oh}`); 
    }, 5000);
  }

  var text = 'Download';
  switch (document.documentElement.lang) {
    case 'cs': text = 'Stáhnout'; break;
    default: text = 'Download'; break;
  }
  let button = $(`<button id="dige-download" type="button" class="btn btn-light mr-1" title="Další snímek" style="display: inline-block; position: relative;">${text}</button>`);
  button.on('click', mzaDownload);
  $('#seadragon-toolbar button[type="button"]:last-of-type').after(button);
}

