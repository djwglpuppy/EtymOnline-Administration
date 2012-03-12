var Input, dateFormat, zeroPad;

Input = Backbone.View.extend({
  tagName: "input",
  attributes: {
    type: "input"
  },
  args: {
    keyup: function() {},
    clear: true
  },
  thisVal: function() {
    return $.trim($(this.el).val());
  },
  length: function() {
    return this.thisVal().length;
  },
  initialize: function(init, args) {
    if (args == null) args = {};
    return _.extend(this.args, args);
  },
  events: {
    "keyup": "prekeyup"
  },
  prekeyup: function(e) {
    var inputinfo;
    inputinfo = {
      keyCode: e.keyCode,
      value: this.thisVal(),
      length: this.thisVal().length
    };
    this.keyup(inputinfo);
    if (e.keyCode === 13) this.enter(inputinfo);
    if (e.keyCode === 27) this.esc(inputinfo);
    if (inputinfo.length === 0) return this.empty();
  },
  keyup: function(args) {
    return this.args.keyup(args);
  },
  enter: function(args) {},
  esc: function(args) {},
  empty: function() {},
  on: function(type, callback) {
    return this[type] = callback;
  },
  clear: function() {
    return this.el.val("");
  }
});

zeroPad = function(n, padding) {
  while (n.toString().length < padding) {
    n = "0" + n;
  }
  return n;
};

dateFormat = function(dateval) {
  var date, day, endhours, hours, iedate, iefix, mer, minutes, month, olddate, year;
  if ($.browser.msie) {
    iefix = dateval.match(/(^.*)T([0-9:]*)/);
    iedate = iefix[1].split("-");
    date = [iedate[1], iedate[2], iedate[0]].join("-");
    olddate = new Date(date + " " + iefix[2]);
    date = new Date(olddate.getFullYear(), olddate.getMonth(), olddate.getDate(), olddate.getHours(), olddate.getMinutes() + (new Date().getTimezoneOffset()));
  } else {
    olddate = new Date(dateval);
    date = new Date(olddate.getFullYear(), olddate.getMonth(), olddate.getDate(), olddate.getHours(), olddate.getMinutes() - olddate.getTimezoneOffset());
    date = olddate;
  }
  month = zeroPad(date.getMonth() + 1, 2);
  day = zeroPad(date.getDate(), 2);
  year = date.getFullYear();
  hours = date.getHours();
  minutes = zeroPad(date.getMinutes(), 2);
  mer = hours >= 12 ? "pm" : "am";
  endhours = zeroPad((hours > 12 ? hours - 12 : hours), 2);
  return "" + month + "-" + day + "-" + year + " " + endhours + ":" + minutes + mer;
};

String.prototype.upTo = function(charLength) {
  var distance;
  distance = this.length;
  if (this.length <= charLength) return String(this);
  return this.substr(0, charLength).replace(/\s\S*$/i, '').trim() + "...";
};
