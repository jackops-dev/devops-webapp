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

  // =========================================================
  // HEALTHCHECK
  // =========================================================

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });

    res.end(JSON.stringify({
      status: 'ok'
    }));

    return;
  }


  // =========================================================
  // KUNDEN
  // =========================================================

  // Alle Kunden anzeigen
  if (req.method === 'GET' && req.url === '/kunden') {
    try {
      const result = await pool.query(
        'SELECT * FROM kunden ORDER BY id;'
      );

      res.writeHead(200, {
        'Content-Type': 'application/json'
      });

      res.end(JSON.stringify(result.rows));
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


  // Einzelnen Kunden anzeigen
  if (req.method === 'GET' && req.url.startsWith('/kunden/')) {
    const id = req.url.split('/')[2];

    try {
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

      res.end(JSON.stringify(result.rows[0]));
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


  // Neuen Kunden anlegen
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
          `INSERT INTO kunden
           (name, email)
           VALUES ($1, $2)
           RETURNING *;`,
          [
            data.name,
            data.email
          ]
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


  // Kunden-E-Mail ändern
  if (
    req.method === 'PATCH' &&
    req.url.startsWith('/kunden/')
  ) {
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
          `UPDATE kunden
           SET email = $1
           WHERE id = $2
           RETURNING *;`,
          [
            data.email,
            id
          ]
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


  // Kunden löschen
  if (
    req.method === 'DELETE' &&
    req.url.startsWith('/kunden/')
  ) {
    const id = req.url.split('/')[2];

    try {
      const result = await pool.query(
        `DELETE FROM kunden
         WHERE id = $1
         RETURNING *;`,
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


  // =========================================================
  // MITARBEITER
  // =========================================================

  // Alle Mitarbeiter anzeigen
  if (req.method === 'GET' && req.url === '/mitarbeiter') {
    try {
      const result = await pool.query(
        'SELECT * FROM mitarbeiter ORDER BY id;'
      );

      res.writeHead(200, {
        'Content-Type': 'application/json'
      });

      res.end(JSON.stringify(result.rows));
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


  // Einzelnen Mitarbeiter anzeigen
  if (
    req.method === 'GET' &&
    req.url.startsWith('/mitarbeiter/')
  ) {
    const id = req.url.split('/')[2];

    try {
      const result = await pool.query(
        'SELECT * FROM mitarbeiter WHERE id = $1;',
        [id]
      );

      if (result.rows.length === 0) {
        res.writeHead(404, {
          'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
          error: 'Mitarbeiter nicht gefunden'
        }));

        return;
      }

      res.writeHead(200, {
        'Content-Type': 'application/json'
      });

      res.end(JSON.stringify(result.rows[0]));
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


  // Neuen Mitarbeiter anlegen
  if (
    req.method === 'POST' &&
    req.url === '/mitarbeiter'
  ) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        if (!data.name) {
          res.writeHead(400, {
            'Content-Type': 'application/json'
          });

          res.end(JSON.stringify({
            error: 'Name ist erforderlich'
          }));

          return;
        }

        const result = await pool.query(
          `INSERT INTO mitarbeiter
           (name)
           VALUES ($1)
           RETURNING *;`,
          [data.name]
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


  // =========================================================
  // WACHBUCH
  // =========================================================

  // Einzelnen Wachbucheintrag anzeigen
  if (
    req.method === 'GET' &&
    req.url.startsWith('/wachbuch/')
  ) {
    const id = req.url.split('/')[2];

    try {
      const result = await pool.query(
        `SELECT
           wachbuch_eintraege.id,
           mitarbeiter.name,
           wachbuch_eintraege.zeitpunkt,
           wachbuch_eintraege.kategorie,
           wachbuch_eintraege.text
         FROM wachbuch_eintraege
         JOIN mitarbeiter
           ON wachbuch_eintraege.mitarbeiter_id = mitarbeiter.id
         WHERE wachbuch_eintraege.id = $1;`,
        [id]
      );

      if (result.rows.length === 0) {
        res.writeHead(404, {
          'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
          error: 'Wachbucheintrag nicht gefunden'
        }));

        return;
      }

      res.writeHead(200, {
        'Content-Type': 'application/json'
      });

      res.end(JSON.stringify(result.rows[0]));
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


  // Alle Wachbucheinträge oder nach Mitarbeiter filtern
  if (req.method === 'GET') {
    const url = new URL(
      req.url,
      `http://${req.headers.host}`
    );

    if (url.pathname === '/wachbuch') {
      try {
        const mitarbeiterId =
          url.searchParams.get('mitarbeiter_id');

        let result;

        if (mitarbeiterId) {
          result = await pool.query(
            `SELECT
               wachbuch_eintraege.id,
               mitarbeiter.name,
               wachbuch_eintraege.zeitpunkt,
               wachbuch_eintraege.kategorie,
               wachbuch_eintraege.text
             FROM wachbuch_eintraege
             JOIN mitarbeiter
               ON wachbuch_eintraege.mitarbeiter_id = mitarbeiter.id
             WHERE wachbuch_eintraege.mitarbeiter_id = $1
             ORDER BY wachbuch_eintraege.zeitpunkt DESC;`,
            [mitarbeiterId]
          );
        } else {
          result = await pool.query(
            `SELECT
               wachbuch_eintraege.id,
               mitarbeiter.name,
               wachbuch_eintraege.zeitpunkt,
               wachbuch_eintraege.kategorie,
               wachbuch_eintraege.text
             FROM wachbuch_eintraege
             JOIN mitarbeiter
               ON wachbuch_eintraege.mitarbeiter_id = mitarbeiter.id
             ORDER BY wachbuch_eintraege.zeitpunkt DESC;`
          );
        }

        res.writeHead(200, {
          'Content-Type': 'application/json'
        });

        res.end(JSON.stringify(result.rows));
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
  }


  // Neuen Wachbucheintrag anlegen
  if (
    req.method === 'POST' &&
    req.url === '/wachbuch'
  ) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        if (
          !data.mitarbeiter_id ||
          !data.kategorie ||
          !data.text
        ) {
          res.writeHead(400, {
            'Content-Type': 'application/json'
          });

          res.end(JSON.stringify({
            error:
              'mitarbeiter_id, kategorie und text sind erforderlich'
          }));

          return;
        }

        const result = await pool.query(
          `INSERT INTO wachbuch_eintraege
           (mitarbeiter_id, kategorie, text)
           VALUES ($1, $2, $3)
           RETURNING *;`,
          [
            data.mitarbeiter_id,
            data.kategorie,
            data.text
          ]
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


  // =========================================================
  // SCHICHTEN
  // =========================================================

  // Alle Schichten anzeigen
  if (
    req.method === 'GET' &&
    req.url === '/schichten'
  ) {
    try {
      const result = await pool.query(
        `SELECT
           id,
           schichtart,
           beginn,
           ende
         FROM schichten
         ORDER BY beginn DESC;`
      );

      res.writeHead(200, {
        'Content-Type': 'application/json'
      });

      res.end(JSON.stringify(result.rows));
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


  // Neue Schicht anlegen
  if (
    req.method === 'POST' &&
    req.url === '/schichten'
  ) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        if (
          !data.schichtart ||
          !data.beginn ||
          !data.ende
        ) {
          res.writeHead(400, {
            'Content-Type': 'application/json'
          });

          res.end(JSON.stringify({
            error:
              'schichtart, beginn und ende sind erforderlich'
          }));

          return;
        }

        if (
          data.schichtart !== 'Tag' &&
          data.schichtart !== 'Nacht'
        ) {
          res.writeHead(400, {
            'Content-Type': 'application/json'
          });

          res.end(JSON.stringify({
            error:
              'schichtart muss Tag oder Nacht sein'
          }));

          return;
        }

        const result = await pool.query(
          `INSERT INTO schichten
           (schichtart, beginn, ende)
           VALUES ($1, $2, $3)
           RETURNING *;`,
          [
            data.schichtart,
            data.beginn,
            data.ende
          ]
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
          error:
            'Schicht konnte nicht angelegt werden'
        }));
      }
    });

    return;
  }


  // =========================================================
  // ARBEITSZEITEN
  // =========================================================

  // Alle Arbeitszeiten anzeigen
  if (
    req.method === 'GET' &&
    req.url === '/arbeitszeiten'
  ) {
    try {
      const result = await pool.query(
        `SELECT
           arbeitszeiten.id,
           arbeitszeiten.schicht_id,
           mitarbeiter.name,
           schichten.schichtart,
           schichten.beginn AS schichtbeginn,
           schichten.ende AS schichtende,
           arbeitszeiten.dienstbeginn,
           arbeitszeiten.dienstende,
           arbeitszeiten.dienstende
             - arbeitszeiten.dienstbeginn AS dauer
         FROM arbeitszeiten
         JOIN mitarbeiter
           ON arbeitszeiten.mitarbeiter_id = mitarbeiter.id
         LEFT JOIN schichten
           ON arbeitszeiten.schicht_id = schichten.id
         ORDER BY arbeitszeiten.dienstbeginn DESC;`
      );

      res.writeHead(200, {
        'Content-Type': 'application/json'
      });

      res.end(JSON.stringify(result.rows));
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


  // Arbeitszeit starten
  if (
    req.method === 'POST' &&
    req.url === '/arbeitszeiten/start'
  ) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        if (
          !data.mitarbeiter_id ||
          !data.schicht_id
        ) {
          res.writeHead(400, {
            'Content-Type': 'application/json'
          });

          res.end(JSON.stringify({
            error:
              'mitarbeiter_id und schicht_id sind erforderlich'
          }));

          return;
        }

        const schichtResult = await pool.query(
  `SELECT *
   FROM schichten
   WHERE id = $1
     AND CURRENT_TIMESTAMP >= beginn
     AND CURRENT_TIMESTAMP <= ende;`,
  [data.schicht_id]
);

        if (schichtResult.rows.length === 0) {
  res.writeHead(400, {
    'Content-Type': 'application/json'
  });

  res.end(JSON.stringify({
    error: 'Schicht nicht gefunden oder aktuell nicht aktiv'
  }));

  return;
}



        const offenerDienst = await pool.query(
          `SELECT *
           FROM arbeitszeiten
           WHERE mitarbeiter_id = $1
             AND dienstende IS NULL;`,
          [data.mitarbeiter_id]
        );

        if (offenerDienst.rows.length > 0) {
          res.writeHead(409, {
            'Content-Type': 'application/json'
          });

          res.end(JSON.stringify({
            error:
              'Mitarbeiter hat bereits einen offenen Dienst'
          }));

          return;
        }

        const result = await pool.query(
          `INSERT INTO arbeitszeiten
           (
             schicht_id,
             mitarbeiter_id,
             dienstbeginn
           )
           VALUES ($1, $2, CURRENT_TIMESTAMP)
           RETURNING *;`,
          [
            data.schicht_id,
            data.mitarbeiter_id
          ]
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


  // Arbeitszeit beenden
  if (
    req.method === 'POST' &&
    req.url === '/arbeitszeiten/ende'
  ) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        if (!data.mitarbeiter_id) {
          res.writeHead(400, {
            'Content-Type': 'application/json'
          });

          res.end(JSON.stringify({
            error: 'mitarbeiter_id ist erforderlich'
          }));

          return;
        }

        const result = await pool.query(
          `UPDATE arbeitszeiten
           SET dienstende = CURRENT_TIMESTAMP
           WHERE mitarbeiter_id = $1
             AND dienstende IS NULL
           RETURNING *;`,
          [data.mitarbeiter_id]
        );

        if (result.rows.length === 0) {
          res.writeHead(404, {
            'Content-Type': 'application/json'
          });

          res.end(JSON.stringify({
            error: 'Kein offener Dienst gefunden'
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


  // =========================================================
  // FALLBACK
  // =========================================================

  res.writeHead(404, {
    'Content-Type': 'text/plain'
  });

  res.end('Nicht gefunden\n');
});


server.listen(3000, '0.0.0.0', () => {
  console.log(
    'Backend läuft erfolgreich auf Port 3000'
  );
});