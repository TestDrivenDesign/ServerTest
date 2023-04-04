const app = require('./app.js');

const  PORT = process.env.PORT || 80;

app.listen(PORT, () => console.log(`Always listening on ${PORT}.`));