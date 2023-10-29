const express = require("express");
const router = express.Router();
const playerController = require("../controllers/playerController");
const daruratController = require("../controllers/daruratController");
const historyController = require("../controllers/histtory");

const {
  SendNotificationAndAddDarurat,
  sendNotification,
} = require("../controllers/firebase_controller");

router.post("/send/:id_event", SendNotificationAndAddDarurat);
router.post(
  "/send1/:id_event",
  historyController.SendNotificationAndAddDarurat
);
router.post("/send", sendNotification);
router.post("/player", playerController.addPlayer);
router.delete(
  "/player/byPlayerId/:playerId",
  playerController.deletePlayerByPlayerId
);
router.post("/darurat/updateStatus/:id_event", daruratController.updateStatus);
router.get(
  "/darurat/byIdEvent/:id_event",
  daruratController.getDaruratByIdEvent
);

module.exports = router;
