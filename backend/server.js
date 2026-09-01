const http = require('http');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const server = http.createServer(async (req, res) => {

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });

    res.end(JSON.stringify({
      status: 'ok'
    }));

    return;
  }

  if (req.method === 'GET' && req.url === '/kunden') {

    try {
      const result = await pool.query('SELECT * FROM kunden;');

      res.writeHead(200, {
        'Content-Type': 'application/json'
      });

      res.end(JSON.stringify(result.rows));
    } catch (error) {
      console.error(error);

      res.writeHead(500, {
        'Content-Type': 'text/plain'
      });

      res.end('Datenbankfehler\n');
    }

    return;
  }

  if (req.method === 'GET' && req.url.startsWith('/kunden/')) {
    try {
      const id = req.url.split('/')[2];

      const result = await pool.query(
        'SELECT * FROM kunden WHERE id = $1;',
        [id]
      );

      if (result.rows.length === 0) {
        res.writeHead(404, {
          'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
          error: 'Kunde nicht gefunden'
        }));

        return;
      }

      res.writeHead(200, {
        'Content-Type': 'application/json'
      });

      res.end(JSON.stringify(result.rows));
    } catch (error) {
      console.error(error);

      res.writeHead(500, {
        'Content-Type': 'text/plain'
      });

      res.end('Datenbankfehler\n');
    }

    return;
  }

  if (req.method === 'POST' && req.url === '/kunden') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
	
	if (!data.name || !data.email) {
 	 res.writeHead(400, {
    	  'Content-Type': 'application/json'
  	});

  	res.end(JSON.stringify({
    	 error: 'Name und E-Mail sind erforderlich'
  	}));

  	return;
}
        const result = await pool.query(
          'INSERT INTO kunden (name, email) VALUES ($1, $2) RETURNING *;',
          [data.name, data.email]
        );

        res.writeHead(201, {
          'Content-Type': 'application/json'
        });

        res.end(JSON.stringify(result.rows[0]));
      } catch (error) {
        console.error(error);

        res.writeHead(400, {
          'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
          error: 'Ungültige Anfrage'
        }));
      }
    });

    return;
  }


  if (req.method === 'PATCH' && req.url.startsWith('/kunden/')) {
    const id = req.url.split('/')[2];
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        if (!data.email) {
          res.writeHead(400, {
            'Content-Type': 'application/json'
          });

          res.end(JSON.stringify({
            error: 'E-Mail ist erforderlich'
          }));

          return;
        }

        const result = await pool.query(
          'UPDATE kunden SET email = $1 WHERE id = $2 RETURNING *;',
          [data.email, id]
        );

        if (result.rows.length === 0) {
          res.writeHead(404, {
            'Content-Type': 'application/json'
          });

          res.end(JSON.stringify({
            error: 'Kunde nicht gefunden'
          }));

          return;
        }

        res.writeHead(200, {
          'Content-Type': 'application/json'
        });

        res.end(JSON.stringify(result.rows[0]));
      } catch (error) {
        console.error(error);

        res.writeHead(400, {
          'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
          error: 'Ungültige Anfrage'
        }));
      }
    });

    return;
  }

  if (req.method === 'DELETE' && req.url.startsWith('/kunden/')) {
    const id = req.url.split('/')[2];

    try {
      const result = await pool.query(
        'DELETE FROM kunden WHERE id = $1 RETURNING *;',
        [id]
      );

      if (result.rows.length === 0) {
        res.writeHead(404, {
          'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
          error: 'Kunde nicht gefunden'
        }));

        return;
      }

      res.writeHead(200, {
        'Content-Type': 'application/json'
      });

      res.end(JSON.stringify({
        message: 'Kunde gelöscht',
        kunde: result.rows[0]
      }));
    } catch (error) {
      console.error(error);

      res.writeHead(500, {
        'Content-Type': 'application/json'
      });

      res.end(JSON.stringify({
        error: 'Datenbankfehler'
      }));
    }

    return;
  }



  res.writeHead(404, {
    'Content-Type': 'text/plain'
  });

  res.end('Nicht gefunden\n');
});
 
server.listen(3000, '0.0.0.0', () => {
  console.log('Backend läuft auf Port 3000');
});
