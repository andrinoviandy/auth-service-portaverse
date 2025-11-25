const express = require("express");
const { kmsMiddleware } = require("../middleware");
const router = express.Router();

const userHandler = require("../handler/user");

// Privilege code SSO_ADD
router.post("/", kmsMiddleware("SSO_ADD"), userHandler.add);

// Privilege code: SSO_UPDATE
router.put(
  "/",
  kmsMiddleware("SSO_UPDATE", false, ["SA", "MNGR"]),
  userHandler.update
);

// Privilege code: SSO_READ
router.post(
  "/other/select-query/:user_id/:test_id",
  kmsMiddleware("SSO_READ"),
  userHandler.selectQuery
);

router.get("/get-score-sso", userHandler.getScoreSso);

module.exports = router;
