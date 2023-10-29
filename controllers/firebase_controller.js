const admin = require("firebase-admin/app");
const getMessaging = require("firebase-admin/messaging").getMessaging;

// Initial setup for Firebase
const FIREBASE_CONFIG = {
  credential: admin.applicationDefault(),
  projectId: "tugas-akihir",
};

admin.initializeApp(FIREBASE_CONFIG);

exports.sendNotification = (req, res) => {
  const receivedToken = req.body.fcmToken;
  const message = {
    notification: {
      title: "Thariq",
      body: "hallo thariq",
    },
    token:
      "egt3unuPSRSjNBwHkLszsU:APA91bHCAPy6VNSYanXPvaakqSbDerbKDzAakUbaVLqsMLSkWIFM4BWzvm-AMGHkwq9BKVQ5Ao4OT00k8MmSoC7_z_wy4BuUHJAnWPxoSVyobeQzNpVLTk0ZLlNztuoCThg6kbuzL5ll",
  };

  getMessaging()
    .send(message)
    .then((response) => {
      res.status(200).json({
        message: "Successfully sent message",
        token: receivedToken,
      });
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      res.status(400);
      res.send(error);
      console.log("Error sending message:", error);
    });
};

exports.SendNotificationAndAddDarurat = async (req, res, next) => {
  try {
    console.log(req.body); // Log the incoming request body

    const id_event = req.params.id_event;
    const ibuData = req.body.ibu;

    if (!ibuData || !ibuData.nama) {
      return res.status(400).send({ message: "Required data missing" });
    }

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

      const message = {
        notification: {
          title: "CUSTOM NOTIFICATIONS",
          body: `Ibu ${ibuData.nama} membutuhkan bantuan Anda`,
        },
        tokens: playerIds,
        data: {
          PushTitle: "CUSTOM NOTIFICATIONS",
          IdPendamping: id_event.toString(),
          NamaIbu: ibuData.nama,
          NoHpIbu: ibuData.noHp,
          AlamatIbu: ibuData.alamat,
          GoldarIbu: ibuData.goldar,
          id_event: ibuData.id_event.toString(),
        },
      };

      getMessaging()
        .sendMulticast(message)
        .then((response) => {
          // Add Darurat
          const { id_ibu, jumlah_kader, jumlah_komunitas, jumlah_sampai } =
            req.body;
          const queryInsert =
            "INSERT INTO darurat_list (id_event, id_ibu, jumlah_kader, jumlah_komunitas, jumlah_sampai) VALUES (?, ?, ?, ?, ?)";
          db.query(
            queryInsert,
            [id_event, id_ibu, jumlah_kader, jumlah_komunitas, jumlah_sampai],
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
        })
        .catch((error) => {
          res.status(400).send(error);
          console.log("Error sending message:", error);
        });
    });
  } catch (error) {
    return next(error);
  }
};
