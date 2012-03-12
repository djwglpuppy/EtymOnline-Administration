mongoose = require('mongoose')
Schema = mongoose.Schema
mongoose.connect("mongodb://localhost/etym")

mongoose.connection.on "open", -> console.log("mongodb is connected!!")

Etym = new Schema
	term: String
	term_suffix: String
	etym: String
	last_updated: Date

exports.etym = mongoose.model("Etym", Etym, "etym")