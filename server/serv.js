const mysql = require('mysql');

// Create a connection to the MySQL server
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
});

// Connect to the MySQL server
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL server');
  connection.query('CREATE DATABASE mydb', (err, result) => {
    if (err) throw err;
    console.log('Database created');
  // Create the class table
  connection.query('USE mydb', (err, result) => {
    if (err) throw err;
  const createClassTable = `CREATE TABLE class (
    class_id INT NOT NULL AUTO_INCREMENT,
    class_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (class_id)
  )`;

  connection.query(createClassTable, (err, result) => {
    if (err) throw err;
    console.log('Class table created');
  });

  // Create the student table
  const createStudentTable = `CREATE TABLE student (
    student_id INT NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    address VARCHAR(255) NOT NULL,
    class_id INT NOT NULL,
    PRIMARY KEY (student_id),
    FOREIGN KEY (class_id) REFERENCES class(class_id)
  )`;

  connection.query(createStudentTable, (err, result) => {
    if (err) throw err;
    console.log('Student table created');
  });
})
  })
});
