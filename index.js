

// global.foodData = require('./db')(function call(err, data, CatData) {
//   // console.log(data)
//   if(err) console.log(err);
//   global.foodData = data;
//   global.foodCategory = CatData;
// })

// const express = require('express')
// const app = express()
// const port = 5000
// var path = require('path');
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "https://fee-mangement-front-end.vercel.app/");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"); // Add PUT method
//   next();
// });
// // set path for static assets
// app.use(express.static(path.join(__dirname, 'uploads')));


// app.use(express.json())

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

// app.use('/api/auth', require('./Routes/Auth'));

// app.listen(port, () => {
//   console.log(`Example app listening on http://localhost:${port}`)
// })


global.foodData = require('./db')(function call(err, data, CatData) {
  // console.log(data)
  if(err) console.log(err);
  global.foodData = data;
  global.foodCategory = CatData;
})

const express = require('express')
const app = express()
const port = 5000
var path = require('path');
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://fee-mangement-front-mka740a8p.vercel.app");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Delete,Post"
  );
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE"); // Allow all methods
  next();
});



// const cors = require('cors');

// const corsOptions = {
//   origin: 'https://localhost:3000', // Your frontend URL
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true,
//   optionsSuccessStatus: 204
// };



// app.use(cors(corsOptions));

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/api/auth', require('./Routes/Auth'));

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
})