express = require('express')
routes = require('./routes')
app = module.exports = express.createServer()

app.configure ->
  app.set('views', __dirname + '/views')
  app.set('view engine', 'jade')
  app.use(express.bodyParser())
  app.use(express.methodOverride())
	app.use(require('stylus').middleware({
      src: __dirname + "/precompiled"
			dest: __dirname + '/static'
			compress: true
  }))
  app.use(app.router)
  app.use(express.static(__dirname + '/static'))

app.get('/', routes.index)
app.get('/terms/:term?', routes.terms)

app.post('/term', routes.term.create)
app.put('/term/:id', routes.term.update)
app.del('/term/:id', routes.term.deletion)

app.listen(3333)
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env)
