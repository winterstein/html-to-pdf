#!/usr/bin/phantomjs
// File: htmltopdf.js
// Author: Joe Halliwell <joe@winterwell.com>, Jonathan Hussey, Daniel W
//
// Example usage:
// htmltopdf.js https://bbc.co.uk/news bbcnews.pdf
//
// Based on example code from https://github.com/ariya/phantomjs/blob/master/examples/rasterize.js
// This requires a relatively recent e.g. >=1.9 version of phantomjs
// TODO: Review and incorporate more ideas from https://github.com/highslide-software/highcharts.com/blob/master/exporting-server/phantomjs/highcharts-convert.js
/**
 * ## How to debug print styling ##
 * Open the reports page in chrome
 * Option 1:    Select pdf version- This file is called and report is generated
 * Option 2:    View the report as a web page
 * Instructions 1.  Right click and inspect element OR F12
 *              2.  Click 'Elements' then hit Esc
 *              3.  Should see 'Emulation' tab
 *              4.  Choose 'Screen' then scroll down and select CSS Media
 *              5.  You can control screen size to emulate the view port setting below (optional)
 *              6.  The layout should switch to Print version
 * Magic ---->  7.  You can apply css changes through the console or whichever you prefer
 *              8.  If you select print you will see what the report looks like in print format
 *              9.  To match the layout to the settings within this file apply the jquery
 *                  within the console window (refer to the debugging code at the base of the document)
 *              10. Finally if you paste the code into the console from the base of the document you will
 *                  be able to affect the print layout of the html based report. HURRAH!
 */

var verbose = true;
var page = require('webpage').create(),
    system = require('system'),
    address, output, size;

if (system.args.length < 3 || system.args.length > 20) {
    console.log('Usage: ' + system.args[0] + ' URL outputfile [paperwidth*paperheight|paperformat] [zoom]');
    // console.log("  You may wish to use 's around the URL to avoid characters being misinterpreted.");
    console.log('  paper (pdf output) examples: "5in*7.5in", "10cm*20cm", "A4", "Letter"');
    console.log("Args length is: " + system.args.length);
	console.log('  zoom: 0.5, 1, 2, "default"');
    console.log('  footer: html to use as the footer');
    phantom.exit(1);
}
address = system.args[1];
output = system.args[2];
// TODO parse the args for options
var paperformat = system.args.length >3? system.args[3] : false;
var zoom = system.args.length >4? parseFloat(system.args[4]) : false;
//viewport size determines rendering
//A4 pixel height size = 1123
//1cm = 37.79px (38)    
page.viewportSize = {
    //if you wish to avoid clipping on chart text then leave this (better implementation required)
    width: 1024, // this is to make bootstrap render as medium and a decen res
    height: 1123
};

page.paperSize = {
        format: 'A4',
        orientation: 'portrait',
        margin: {
            top: '1cm',
            left: '1cm',
            right: '1cm',
            bottom: '1cm'
        },
        quality: '100'
    };
// override the A4 default?
if (paperformat) {
    var size = paperformat.split('*');
    //in this case A4 is normally selected
    if (size.length === 2) {
        page.paperSize = {
            width: size[0],
            height: size[1],
            margin: '0px',
            quality: '100'
        };
    } else {

    }
    if (verbose) console.log("Set paper-format to "+paperformat+" = "+page.paperSize);
}

if (zoom && zoom>0) {
    if (verbose) console.log("Set zoom to "+zoom);
    page.zoomFactor = zoom;    
}

function render_page() {
    if (verbose) console.log("Evaluating page");
    page.onConsoleMessage = function(msg) {
        console.log(msg);
    };

    // Do the actual render
    console.log("Rendering to " + output);
    page.render(output);
    phantom.exit();
};

page.open(address, function(status) {
    if (status !== 'success') {
        console.log('Unable to load the address!');
        phantom.exit();
    } else {
        console.log('Page '+address+' loaded. Rendering...');
        // Wait a bit to let animations run
        window.setTimeout(render_page, 2000);
    }
});

// HACK: If all else fails generate something and exit cleanly...
// ??Not convinced this is the correct behaviour. Pro: robust in face of some errors; Con: Caller (Java) doesn't know things have gone awry
window.setTimeout(function() {
    console.log('Timed out!');
    render_page();
}, 20000);
