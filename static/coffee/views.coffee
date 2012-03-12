Input = Backbone.View.extend
	tagName: "input"
	attributes:
		type: "input"

	args:
		keyup: ->
		clear: true
		
	thisVal: ->
		$.trim($(this.el).val())
	
	length: -> this.thisVal().length
	
	initialize: (init, args = {}) ->
		_.extend(this.args, args)

	events:
		"keyup": "prekeyup"
	
	prekeyup: (e) ->
		inputinfo = 
			keyCode: e.keyCode
			value: this.thisVal()
			length: this.thisVal().length
		
		this.keyup(inputinfo)	
		this.enter(inputinfo) if e.keyCode is 13
		this.esc(inputinfo) if e.keyCode is 27
		this.empty() if inputinfo.length is 0

	
	keyup: (args) -> this.args.keyup(args)
	enter: (args) ->
	esc: (args) ->
	empty: ->
		
	on: (type, callback) -> this[type] = callback
		
	clear: -> this.el.val("")


zeroPad = (n, padding) -> n = "0#{n}" while n.toString().length < padding; n


dateFormat = (dateval) ->
	if $.browser.msie
		iefix = dateval.match(/(^.*)T([0-9:]*)/)
		iedate = iefix[1].split("-")
		date = [iedate[1], iedate[2], iedate[0]].join("-")
		olddate = new Date(date + " " + iefix[2])
		date = new Date(olddate.getFullYear(), olddate.getMonth(), olddate.getDate(), olddate.getHours(), olddate.getMinutes() + (new Date().getTimezoneOffset()))
	else
		olddate = new Date(dateval)
		date = new Date(olddate.getFullYear(), olddate.getMonth(), olddate.getDate(), olddate.getHours(), olddate.getMinutes() - olddate.getTimezoneOffset())
		date = olddate
		
	
	month = zeroPad(date.getMonth() + 1, 2)
	day = zeroPad(date.getDate(), 2)
	year = date.getFullYear()
	hours = date.getHours()
	minutes = zeroPad(date.getMinutes(), 2)
	mer = if hours >= 12 then "pm" else "am"

	endhours = zeroPad((if hours > 12 then hours - 12 else hours), 2)
	"#{month}-#{day}-#{year} #{endhours}:#{minutes}#{mer}"


String::upTo = (charLength) ->
		distance = this.length
		return String(this) if this.length <= charLength
		return this.substr(0, charLength).replace(/\s\S*$/i, '').trim() + "..."
	