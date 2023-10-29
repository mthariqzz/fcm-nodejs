const FCM = require("fcm-node");
const mysql = require("mysql");
const dbConfig = require("../config/db.config");

const serverkey =
  "AAAAa6ejQ6I:APA91bFoGDmUw9ke_X691kkh5VoeNWXfDhogig19MYKWFlqMFe8BxwBEuY8cE9BJH6UT8O14NwhtJyMRHqa-JuWefxZu60GeKYhV0sqm04ndn0HnZNfroVemuNyrNzKMVq-RqMKDUZzY";
const fcm = new FCM(serverkey);

const db = mysql.createConnection({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
});

db.connect((error) => {
  if (error) {
    throw error;
  }
  console.log("Successfully connected to the database");
});

global.db = db;

exports.SendNotificationAndAddDarurat = async (req, res, next) => {
  try {
    const id_event = req.params.id_event;

    const query = "SELECT playerId FROM players WHERE id_event = ?";
    db.query(query, [id_event], async (error, results) => {
      if (error) {
        return res
          .status(500)
          .send({ message: "Database error", error: error });
      }

      const playerIds = results.map((result) => result.playerId);

      if (!playerIds.length) {
        return res.status(404).send({ message: "Players not found" });
      }

      const ibuData = req.body.ibu;
      const additionalData = req.body; // assuming the additional data is in the request body

      // Create a message with custom data fields
      const message = {
        notification: {
          title: `Notifikasi Darurat`,
          body: `Ibu ${ibuData.nama} membutuhkan bantuan Anda`,
          android_channel_id: "com.example.pendamping_arimbi",
        },

        data: {
          nama: ibuData.nama,
          noHp: ibuData.noHp,
          alamat: ibuData.alamat,
          goldar: ibuData.goldar,
          id_event: id_event.toString(), // assuming this is a numerical ID
          id_ibu: additionalData.id_ibu.toString(),
          jumlah_kader: additionalData.jumlah_kader.toString(),
          jumlah_komunitas: additionalData.jumlah_komunitas.toString(),
          jumlah_sampai: additionalData.jumlah_sampai.toString(),
        },
        registration_ids: playerIds,
      };

      // Send a message to the devices corresponding to the provided registration tokens.
      fcm.send(message, async (err, response) => {
        if (err) {
          return next(err);
        }

        // If message sending succeeded, we're logging the response and inserting a record in the database
        console.log("Successfully sent message:", response);

        const queryInsert =
          "INSERT INTO darurat_list (id_event, id_ibu, jumlah_kader, jumlah_komunitas, jumlah_sampai) VALUES (?, ?, ?, ?, ?)";
        db.query(
          queryInsert,
          [
            id_event,
            additionalData.id_ibu,
            additionalData.jumlah_kader,
            additionalData.jumlah_komunitas,
            additionalData.jumlah_sampai,
          ],
          (error, results) => {
            if (error) {
              return res.status(500).send({ message: error.message });
            }
            res.status(201).send({
              message: "Notifications Sent and Darurat added successfully!",
              data: results,
            });
          }
        );
      });
    });
  } catch (error) {
    return next(error);
  }
};
