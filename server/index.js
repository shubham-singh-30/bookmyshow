const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "mydb",
});
app.listen(5000, () => console.log("app listening on 5000"));
app.get('/api/cities', (req, res) => {
  db.query('SELECT * FROM cities', (err, results) => {
    if (err) {
      console.error('Error getting cities: ', err);
      res.status(500).send('Error getting cities');
    } else {
      res.json(results);
    }
  });
});

app.get('/api/theaters/:cityId', (req, res) => {
  const { cityId } = req.params;
  db.query('SELECT * FROM theaters WHERE city_id = ?', [cityId], (err, results) => {
    if (err) {
      console.error(`Error getting theaters for city ${cityId}: `, err);
      res.status(500).send(`Error getting theaters for city ${cityId}`);
    } else {
      res.json(results);
    }
  });
});

app.post('/movies/add-to-theatres', (req, res) => {
  const { movieId, theatreIds } = req.body;

  // Loop through each theatre ID and insert a new record into the theatre_movies table
  for (const theatreId of theatreIds) {
    const query = `INSERT INTO theatre_movies (theatre_id, movie_id) VALUES (?, ?)`;
    const values = [theatreId, movieId];

    db.query(query, values, (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).send('Error adding movie to theatre');
      } else {
        console.log(`Added movie ${movieId} to theatre ${theatreId}`);
      }
    });
  }

  res.status(200).send('Movie added to theatres successfully');
});
app.get('/api/movies/:theaterId', (req, res) => {
  const { theaterId } = req.params;
  db.query(`
    SELECT movies.*
    FROM movies
    INNER JOIN theater_movies
    ON movies.id = theater_movies.movie_id
    WHERE theater_movies.theater_id = ?
  `, [theaterId], (err, results) => {
    if (err) {
      console.error(`Error getting movies for theater ${theaterId}: `, err);
      res.status(500).send(`Error getting movies for theater ${theaterId}`);
    } else {
      res.json(results);
    }
  });
});

app.get('/api/ticket-quantities/:theaterId/:movieId', (req, res) => {
  const { theaterId, movieId } = req.params;
  db.query('SELECT * FROM ticket_quantities WHERE theater_id = ? AND movie_id = ?', [theaterId, movieId], (err, results) => {
    if (err) {
      console.error(`Error getting ticket quantities for theater ${theaterId} and movie ${movieId}: `, err);
      res.status(500).send(`Error getting ticket quantities for theater ${theaterId} and movie ${movieId}`);
    } else {
      res.json(results);
    }
  });
});
// POST /theatres/update-ticket-quantity
app.post('/ticket_quantity', (req, res) => {
  const theaterId = req.body.theater_id;
  const movieId = req.body.movie_id;
  const quantity = req.body.quantity;

  const sql = `INSERT INTO ticket_quantities (theater_id, movie_id, quantity) VALUES (?, ?, ?)`;
  const values = [theaterId, movieId, quantity];

  // Execute the SQL query
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error adding ticket quantity');
    } else {
      res.status(200).send('Ticket quantity added successfully');
    }
  });
});

app.post('/api/bookings', (req, res) => {
  const { theaterId, movieId, quantity } = req.body;
  db.query('INSERT INTO bookings (theater_id, movie_id, quantity) VALUES (?, ?, ?)', [theaterId, movieId, quantity], (err, result) => {
    if (err) {
      console.error(`Error creating booking: `, err);
      res.status(500).send(`Error creating booking`);
    } else {
      res.json({ id: result.insertId });
    }
  });
});

app.get('/api/bookings/:bookingId', (req, res) => {
  const { bookingId } = req.params;
  db.query('SELECT * FROM bookings WHERE id = ?', [bookingId], (err, results) => {
    if (err) {
      console.error(`Error getting booking details for booking ${bookingId}: `, err);
      res.status(500).send(`Error getting booking details for booking ${bookingId}`);
    } else if (results.length === 0) {
      res.status(404).send(`Booking with ID ${bookingId} not found`);
    } else {
      res.json(results[0]);
    }
  });
});
