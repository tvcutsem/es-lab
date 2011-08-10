// Copyright (C) 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Exports a {@code ses.logger} which logs to a div on
 * an HTML page.
 *
 * <p>To use the file, before loading <code>logger.js</code> or
 * <code>initSES*.js</code> which includes <code>logger.js</code>, you must
 * load and initialize this file. <code>logger.js</code> will then detect
 * that there is already a logger in place and not overwrite it. For
 * example, the beginning of your html file might read
 * <pre>  &lt;div id="reports"&gt;&lt;/div&gt;
 *   &lt;div id="console"&gt;&lt;/div&gt;
 *   &lt;script src="htmlLogger.js"&gt;&lt;/script&gt;
 *   &lt;script&gt;
 *     function gebi(id) { return document.getElementById(id); };
 *     htmlLogger(gebi("reports"), gebi("console"));
 *   &lt;/script&gt;
 *   &lt;script src="initSES.js"&gt;&lt;/script&gt;
 * </pre>
 *
 * <p>Assumes only ES3. Compatible with ES5, ES5-strict, or
 * anticipated ES6.
 *
 * @author Mark S. Miller
 * @requires document
 * @overrides ses
 * @provides htmlLogger
 */
var ses;
if (!ses) { ses = {}; }

function htmlLogger(divReports, divConsole) {
  "use strict";

  var maxDiv;

  function appendChild(parent, tagName) {
    var result = document.createElement(tagName);
    parent.appendChild(result);
    return result;
  }

  function appendText(parent, text) {
    var result = document.createTextNode(text);
    parent.appendChild(result);
    return result;
  }

  function textAdder(parent, style) {
    return function(text) {
      var div = appendChild(parent, 'div');
      appendText(div, text);
      div.className = style;
      return div;
    };
  }

  function deflate(toggler, inflatable) {
    inflatable.style.display = 'none';
    toggler.addEventListener('click', function(event) {
      var d = inflatable.style.display;
      inflatable.style.display = d === 'none' ? 'block' : 'none';
    }, false);
    toggler.style.cursor = 'pointer';
    return inflatable;
  }

  var logger = {
    log:   textAdder(divConsole, 'log'),
    info:  textAdder(divConsole, 'info'),
    warn:  textAdder(divConsole, 'warn'),
    error: textAdder(divConsole, 'error')
  };

  /**
   * Logs a report suitable for display on a web page.
   */
  logger.reportRepairs = function(reports) {
    var numFineDiv = appendChild(divReports, 'div');
    var ul = appendChild(divReports, 'ul');

    var numFine = 0;

    reports.forEach(function(report, i) {
      var li = appendChild(ul, 'li');
      if (report.status === ses.statuses.ALL_FINE) {
        numFine++;
        deflate(numFineDiv, li);
      }

      var reportDiv = appendChild(li, 'div');

      var classification = ses.logger.classify(report.postSeverity);
      reportDiv.className = classification.consoleLevel;

      appendText(reportDiv, i + ') ' + report.status + ': ' +
                 report.description + '. ' + classification.note);

      if (typeof report.beforeFailure === 'string') {
        var beforeDiv = appendChild(reportDiv, 'div');
        appendText(beforeDiv, 'New pre symptom: ' + report.beforeFailure);
      }
      if (typeof report.afterFailure === 'string') {
        var afterDiv = appendChild(reportDiv, 'div');
        appendText(afterDiv, 'New post symptom: ' + report.afterFailure);
      }

      var linksBlock = appendChild(li, 'blockquote');
      deflate(reportDiv, linksBlock);

      // TODO(erights): sort by URL relevance based on platform
      report.urls.forEach(function(url, i) {
        var linkDiv = appendChild(linksBlock, 'div');
        if (i === 0) { appendText(linkDiv, 'See '); }
        var link = appendChild(linkDiv, 'a');
        link.href = url;
        link.target = '_blank';
        appendText(link, url);
        // TODO(erights): spawn a task to fetch the title of the bug
        // and use it to replace the link text.
      });

      report.sections.forEach(function(section, i) {
        var linkDiv = appendChild(linksBlock, 'div');
        if (i === 0) { appendText(linkDiv, 'See '); }
        var link = appendChild(linkDiv, 'a');
        link.href = 'http://es5.github.com/#x' + encodeURIComponent(section);
        link.target = '_blank';
        appendText(link, 'Section ' + section);
      });

      report.tests.forEach(function(test, i) {
        var linkDiv = appendChild(linksBlock, 'div');
        if (i === 0) { appendText(linkDiv, 'See '); }
        var link = appendChild(linkDiv, 'a');
        link.href = 'http://www.google.com/search?btnI=&q=' +
                    encodeURIComponent(test) + '+site%3Acode.google.com';
        link.target = '_blank';
        appendText(link, 'Test ' + test);
      });
    });

    if (numFine >= 1) {
      appendText(numFineDiv, numFine + ' fine...');
    }

    maxDiv = appendChild(divReports, 'div');
    if (ses.maxSeverity.level > ses.severities.SAFE.level) {
      var maxClassification = ses.logger.classify(ses.maxSeverity);
      maxDiv.className = maxClassification.consoleLevel;
      appendText(maxDiv, 'Max Severity: ' + maxClassification.note);
    }
  };

  logger.reportDiagnosis = function(severity, desc, problemList) {
    var diagnosisDiv = appendChild(divReports, 'div');
    var classification = ses.logger.classify(severity);
    var head = textAdder(diagnosisDiv, classification.consoleLevel)(
      desc + ' ' + problemList.length + '...');
    var tail = textAdder(diagnosisDiv, classification.consoleLevel)(
      problemList.sort().join(' '));
    deflate(head, tail);
  };

  ses.logger = logger;
}
