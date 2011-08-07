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
 * @fileoverview Exports a {@code ses.logger} which logs to the
 * console if one exists.
 *
 * <p>Assumes only ES3. Compatible with ES5, ES5-strict, or
 * anticipated ES6.
 *
 * @author Mark S. Miller
 * @requires ses?, ses.logger?, ses.logger.reportRepairs?
 *           ses.severities, ses.maxSeverity, ses.maxAcceptableSeverity,
 *           ses.statuses
 * @provides ses.logger
 */
var ses;
if (!ses) { ses = {}; }

(function() {
  "use strict";

  var logger;
  function logNowhere(str) {}

  if (ses.logger) {
    logger = ses.logger;

  } else if (typeof console !== 'undefined' && 'log' in console) {
    // We no longer test (typeof console.log === 'function') since,
    // on IE9 and IE10preview, in violation of the ES5 spec, it
    // is callable but has typeof "object".
    // TODO(erights): report to MS.

    // TODO(erights): This assumes without checking that if
    // console.log is present, then console has working log, info,
    // warn, and error methods. Check that this is actually the case
    // on all platforms we care about, or, if not, do something
    // fancier here.

    // We manually wrap each call to a console method because <ul>
    // <li>On some platforms, these methods depend on their
    //     this-binding being the console.
    // <li>All this has to work on platforms that might not have their
    //     own {@code Function.prototype.bind}, and has to work before
    //     we install an emulated bind.
    // </ul>

    logger = {
      log:   function(str) { console.log(str); },
      info:  function(str) { console.info(str); },
      warn:  function(str) { console.warn(str); },
      error: function(str) { console.error(str); }
    };
  } else {
    logger = {
      log:   logNowhere,
      info:  logNowhere,
      warn:  logNowhere,
      error: logNowhere
    };
  }

  /**
   * By default, logs a report suitable for display on the console.
   */
  function defaultReportRepairs(reports) {
    var MAX_SES_SAFE = ses.severities.SAFE_SPEC_VIOLATION;

    reports.forEach(function(report, i) {
      if (report.status === ses.statuses.ALL_FINE) { return; }

      var beforeFailureStr = typeof report.beforeFailure === 'string' ?
                        '\nNew pre symptom: ' + report.beforeFailure : '';

      var afterFailureStr = typeof report.afterFailure === 'string' ?
                        '\nNew post symptom: ' + report.afterFailure : '';
      var note = '';
      var level = 'info';
      if (report.postSeverity.level > ses.maxAcceptableSeverity.level) {
        level = 'error';
        note = 'This platform is not suitable for SES. ';
      } else if (report.postSeverity.level > MAX_SES_SAFE.level) {
        level = 'warn';
        note = 'This platform is not SES-safe. ';
      }
      logger[level](i + '(' + report.postSeverity.level + ') ' +
                    report.status + ': ' +
                    report.description + '. ' + note +
                    // TODO(erights): select most relevant URL based
                    // on platform
                    (report.urls[0] ? 'See ' + report.urls[0] : '') +
                    beforeFailureStr + afterFailureStr);
    });

    var maxLevel = 'info';
    var maxNote = 'is SES-safe';
    if (!ses.ok()) {
      maxLevel = 'error';
      maxNote = 'is not suitable for SES';
    } else if (ses.maxSeverity.level > MAX_SES_SAFE.level) {
      maxLevel = 'warn';
      maxNote = 'is not SES-safe';
    }
    logger[maxLevel]('Max Severity(' + ses.maxSeverity.level + '): "' +
                     ses.maxSeverity.description + '" ' + maxNote + '.');

  };

  if (!logger.reportRepairs) {
    logger.reportRepairs = defaultReportRepairs;
  }

  ses.logger = logger;

})();
