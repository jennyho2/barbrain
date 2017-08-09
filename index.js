var express = require('express');
var cors = require('cors');
var app = express();

var bodyParser = require("body-parser");


app.use(cors());

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.json());


app.use('/', require('./app/routes'));

// Bariloche cerveza_patago13 XCXxRHUsSuF3n3D4s6Lm bsn9GpsHt8UClvnEukGa
// Tejeda cerveza_patago9 Wut9Y3BigxgEgChgzvNB YjVS0nEgBXI9gSh5dmuC
// Goose Island goose_island_p fUOEUo4DToNuuTLuda04 R65QzAE6RnctGY8Dta2n


require('./app/db').connect().then(db => {
  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});
