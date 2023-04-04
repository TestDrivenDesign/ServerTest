const app = require('./app.js');

const  PORT = process.env.PORT || 9095;

app.listen(PORT, () => console.log(`Listening on ${PORT}...`));