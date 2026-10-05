const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const CANONICAL_ORIGIN = 'https://astrorootwork.com';

app.use((req, res, next) => {
  const host = (req.get('host') || '').toLowerCase();

  if (host.endsWith('.up.railway.app')) {
    return res.redirect(301, CANONICAL_ORIGIN + req.originalUrl);
  }

  next();
});

app.use('/data', express.static(path.join(__dirname, 'data')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(PORT, () => {
  console.log('The House of Maranatha is open on port ' + PORT);
});
