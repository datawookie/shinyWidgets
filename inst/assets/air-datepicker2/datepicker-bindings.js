// airDatepicker bindings //

/*jshint
  jquery:true
*/
/*global Shiny */

var AirPickerInputBinding = new Shiny.InputBinding();
$.extend(AirPickerInputBinding, {
  initialize: function initialize(el) {
    var config = $(el)
      .parent()
      .parent()
      .find('script[data-for="' + el.id + '"]');

    config = JSON.parse(config.html());
    var options = config.options;

    if (config.hasOwnProperty("value")) {
      var dateraw = config.value;
      var datedefault = [];
      for (var i = 0; i < dateraw.length; i++) {
        datedefault[i] = new Date(dateraw[i]);
      }
      config.value = datedefault;
    }

    if (options.hasOwnProperty("minDate")) {
      options.minDate = new Date(options.minDate);
    }
    if (options.hasOwnProperty("maxDate")) {
      options.maxDate = new Date(options.maxDate);
    }
    if (options.hasOwnProperty("startDate")) {
      options.startDate = new Date(options.startDate);
    }
    if (config.todayButtonAsDate) {
      options.todayButton = new Date(options.todayButton);
    }

    // disable dates
    var disabledDates = [];
    if (config.hasOwnProperty("disabledDates")) {
      disabledDates = config.disabledDates;
    }
    var highlightedDates = [];
    if (config.hasOwnProperty("highlightedDates")) {
      highlightedDates = config.highlightedDates;
    }
    options.onRenderCell = function(d, type) {
      if (type == "day") {
        var disabled = false,
          highlighted = 0,
          formatted = getFormattedDate(d);

        disabled = disabledDates.filter(function(date) {
          return date == formatted;
        }).length;

        highlighted = highlightedDates.filter(function(date) {
          return date == formatted;
        }).length;

        var html = d.getDate();
        var classes = "";
        if (highlighted > 0) {
          html = d.getDate() + '<span class="dp-note"></span>';
          classes = "airdatepicker-highlighted";
        }

        return {
          html: html,
          classes: classes,
          disabled: disabled
        };
      }
    };

    if (config.updateOn == "close") {
      options.onHide = function(inst, animationCompleted) {
        if (animationCompleted) {
          $(el).trigger("change");
        }
      };
    } else {
      options.onSelect = function(formattedDate, date, inst) {
        $(el).trigger("change");
      };
    }

    var dp = $(el)
      .airdatepicker(options)
      .data("airdatepicker");
    dp.selectDate(config.value);
    if (config.hasOwnProperty("startView")) {
      dp.date = new Date(config.startView);
    }
  },
  find: function(scope) {
    return $(scope).find(".sw-air-picker");
  },
  getId: function(el) {
    return $(el).attr("id");
  },
  getType: function(el) {
    if ($(el).attr("data-timepicker") !== "false") {
      return "air.datetime";
    } else {
      return "air.date";
    }
  },
  getValue: function(el) {
    var sd = $(el)
      .airdatepicker()
      .data("airdatepicker").selectedDates;
    var timepicker = $(el).attr("data-timepicker");
    var res;

    function padZeros(n, digits) {
      var str = n.toString();
      while (str.length < digits) {
        str = "0" + str;
      }
      return str;
    }
    function formatDate(date) {
      if (date instanceof Date) {
        return (
          date.getFullYear() +
          "-" +
          padZeros(date.getMonth() + 1, 2) +
          "-" +
          padZeros(date.getDate(), 2)
        );
      } else {
        return null;
      }
    }

    if (typeof sd != "undefined" && sd.length > 0) {
      if (timepicker === "false") {
        res = sd.map(function(e) {
          //console.log(e);
          return formatDate(e);
        });
      } else {
        //var tz = new Date().toString().match(/([-\+][0-9]+)\s/)[1];
        res = sd.map(function(e) {
          return e.valueOf(); //toISOString() + tz;
        });
        //res = sd ;
      }
      return res;
    } else {
      return null;
    }
  },
  setValue: function(el, value) {
    value = JSON.parse(value);
    var newdate = [];
    for (var i = 0; i < value.length; i++) {
      newdate[i] = new Date(value[i]);
    }
    var datepicker = $(el)
      .airdatepicker()
      .data("airdatepicker");
    datepicker.selectDate(newdate);
    //datepicker.date = newdate[0];
  },
  subscribe: function(el, callback) {
    $(el).on("change", function(event) {
      callback();
    });
  },
  unsubscribe: function(el) {
    $(el).off(".AirPickerInputBinding");
  },
  receiveMessage: function(el, data) {
    var calendar = $(el)
      .airdatepicker()
      .data("airdatepicker");
    if (data.clear) {
      calendar.clear();
    }
    if (data.show) {
      calendar.show();
    }
    if (data.hide) {
      calendar.hide();
    }
    if (data.hasOwnProperty("value")) this.setValue(el, data.value);

    if (data.hasOwnProperty("label")) {
      // console.log(el);
      $(el)
        .parent()
        .parent()
        .find('label[for="' + data.id + '"]')
        .text(data.label);
    }

    if (data.hasOwnProperty("options")) {
      var options = data.options;

      if (options.hasOwnProperty("minDate")) {
        options.minDate = new Date(options.minDate);
      }
      if (options.hasOwnProperty("maxDate")) {
        options.maxDate = new Date(options.maxDate);
      }

      if (
        options.hasOwnProperty("disabledDates") |
        options.hasOwnProperty("highlightedDates")
      ) {
        var disabledDates = [];
        if (options.hasOwnProperty("disabledDates")) {
          disabledDates = options.disabledDates;
        }
        var highlightedDates = [];
        if (options.hasOwnProperty("highlightedDates")) {
          highlightedDates = options.highlightedDates;
        }
        options.onRenderCell = function(d, type) {
          if (type == "day") {
            var disabled = false,
              highlighted = 0,
              formatted = getFormattedDate(d);

            disabled = disabledDates.filter(function(date) {
              return date == formatted;
            }).length;

            highlighted = highlightedDates.filter(function(date) {
              return date == formatted;
            }).length;

            var html = d.getDate();
            var classes = "";
            if (highlighted > 0) {
              html = d.getDate() + '<span class="dp-note"></span>';
              classes = "airdatepicker-highlighted";
            }

            return {
              html: html,
              classes: classes,
              disabled: disabled
            };
          }
        };
      }

      $(el)
        .airdatepicker()
        .data("airdatepicker")
        .update(options);

      if (options.hasOwnProperty("startView")) {
        var dp = $(el)
          .airdatepicker()
          .data("airdatepicker");
        dp.date = new Date(options.startView);
      }
    }

    if (data.hasOwnProperty("placeholder")) {
      $("#" + data.id)[0].placeholder = data.placeholder;
    }

    $(el).trigger("change");
  }
});
Shiny.inputBindings.register(
  AirPickerInputBinding,
  "shinyWidgets.AirPickerInput"
);

/*
  function parse_date(date) {
    return date.getUTCFullYear() + '-' + date.getUTCMonth() + '-' + date.getUTCDate();
  }
  */

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [
    this.getFullYear(),
    (mm > 9 ? "" : "0") + mm,
    (dd > 9 ? "" : "0") + dd
  ].join("-");
};

function getFormattedDate(date) {
  var year = date.getFullYear(),
    month = date.getMonth() + 1,
    day = date.getDate();

  if (month > 9) {
    if (day > 9) {
      return year + "-" + month + "-" + day;
    } else {
      return year + "-" + month + "-0" + day;
    }
  } else {
    if (day > 9) {
      return year + "-0" + month + "-" + day;
    } else {
      return year + "-0" + month + "-0" + day;
    }
  }
}
