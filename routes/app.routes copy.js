const pushNotificationController = require("../controllers/push-notification.controllers");
const playerController = require("../controllers/playerController");
const daruratController = require("../controllers/daruratController");

const express = require("express");
const router = express.Router();

// Existing routes for notifications
router.get("/sendNotification", pushNotificationController.SendNotification);
router.get(
  "/SendNotificationAndAddDarurat",
  pushNotificationController.SendNotificationAndAddDarurat
);
router.post(
  "/sendNotificationToDevice",
  pushNotificationController.SendNotificationToDevice
);
router.post(
  "/SendNotificationPendamping/:id_event",
  pushNotificationController.SendNotificationPendamping
);

// New combined route for notifications and adding Darurat
router.post(
  "/SendNotificationAndAddDarurat/:id_event",
  pushNotificationController.SendNotificationAndAddDarurat
);

// Routes for player management
router.post("/player", playerController.addPlayer);
router.delete(
  "/player/byPlayerId/:playerId",
  playerController.deletePlayerByPlayerId
);

// Route for updating Darurat status
router.post("/darurat/updateStatus/:id_event", daruratController.updateStatus);

// New route for getting Darurat data by id_event
router.get(
  "/darurat/byIdEvent/:id_event",
  daruratController.getDaruratByIdEvent
); // <-- New line here

// Uncomment these if you want to use them later
// router.post("/darurat", daruratController.addDarurat);
// router.post("/darurat/updateStatus", daruratController.updateStatus);
// router.post(
//   "/darurat/addAndNotify",
//   pushNotificationController.addDaruratAndNotify
// );

module.exports = router;
