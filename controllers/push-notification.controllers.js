// const { ONE_SIGNAL_CONFIG } = require("../config/app.config");
// const pushNotificationService = require("../services/push-notification-services");
// const { io } = require("../index");

// exports.SendNotificationAndAddDarurat = async (req, res, next) => {
//   try {
//     // Send Notification
//     const id_event = req.params.id_event;

//     const query = "SELECT playerId FROM players WHERE id_event = ?";
//     db.query(query, [id_event], async (error, results) => {
//       if (error) {
//         return res
//           .status(500)
//           .send({ message: "Database error", error: error });
//       }

//       const playerIds = results.map((result) => result.playerId);

//       if (!playerIds.length) {
//         return res.status(404).send({ message: "Players not found" });
//       }

//       const ibuData = req.body.ibu;

//       var message = {
//         app_id: ONE_SIGNAL_CONFIG.APP_ID,
//         contents: { en: `Ibu ${ibuData.nama} membutuhkan bantuan Anda` },
//         include_player_ids: playerIds,
//         content_available: true,
//         small_icon: "ic_notification_icon",
//         data: {
//           PushTitle: "CUSTOM NOTIFICATIONS",
//           IdPendamping: id_event,
//           NamaIbu: ibuData.nama,
//           NoHpIbu: ibuData.noHp,
//           AlamatIbu: ibuData.alamat,
//           GoldarIbu: ibuData.goldar,
//           id_event: ibuData.id_event,
//         },
//       };

//       pushNotificationService.SendNotification(
//         message,
//         async (errors, results) => {
//           if (errors) {
//             return next(errors);
//           }
//           io.emit("notifikasiDarurat", { message: `Ibu ${ibuData.nama} membutuhkan bantuan Anda` });
//           // Add Darurat
//           const { id_ibu, jumlah_kader, jumlah_komunitas, jumlah_sampai } =
//             req.body;

//           const queryInsert =
//             "INSERT INTO darurat_list (id_event, id_ibu, jumlah_kader, jumlah_komunitas, jumlah_sampai) VALUES (?, ?, ?, ?, ?)";
//           db.query(
//             queryInsert,
//             [id_event, id_ibu, jumlah_kader, jumlah_komunitas, jumlah_sampai],
//             (error, results) => {
//               if (error) {
//                 return res.status(500).send({ message: error.message });
//               }
//               res.status(201).send({
//                 message: "Notifications Sent and Darurat added successfully!",
//                 data: results,
//               });
//             }
//           );
//         }
//       );
//     });
//   } catch (error) {
//     return next(error);
//   }
// };
