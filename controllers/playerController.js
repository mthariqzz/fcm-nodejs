exports.addPlayer = async (req, res) => {
  const players = req.body;

  // Validate that the input is an array
  if (!Array.isArray(players)) {
    return res.status(400).send({ message: "Expected an array of players" });
  }

  // Create an array of promises for database queries
  const queries = players.map((player) => {
    return new Promise((resolve, reject) => {
      const { playerId, id_event, id_pendamping } = player;

      // Validate playerId and id_event
      if (!playerId || playerId.trim() === "") {
        reject({ message: "playerId is required" });
      }
      if (!id_event || id_event.trim() === "") {
        reject({ message: "id_event is required" });
      }

      // Check if the player data already exists
      const queryCheck =
        "SELECT * FROM players WHERE playerId = ? AND id_event = ?";
      db.query(queryCheck, [playerId, id_event], (error, results) => {
        if (error) {
          reject({ message: error.message });
        } else if (results.length > 0) {
          resolve({ message: "Data already exists" }); // Skip insertion
        } else {
          // Insert new player data
          const queryInsert =
            "INSERT INTO players (playerId, id_event, id_pendamping) VALUES (?, ?, ?)";
          db.query(
            queryInsert,
            [playerId, id_event, id_pendamping],
            (error, results) => {
              if (error) {
                reject({ message: error.message });
              } else {
                resolve();
              }
            }
          );
        }
      });
    });
  });

  // Execute all promises
  try {
    await Promise.all(queries);
    // The io.emit line has been removed here
    res.status(201).send({ message: "Players added successfully!" });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.deletePlayerByPlayerId = (req, res) => {
  const playerId = req.params.playerId;

  const query = "DELETE FROM players WHERE playerId = ?";

  db.query(query, [playerId], (error, results) => {
    if (error) {
      return res.status(500).send({ message: error.message });
    }
    if (results.affectedRows == 0) {
      return res.status(404).send({ message: "Player not found" });
    }

    res.status(200).send({ message: "Player deleted successfully!" });
  });
};
