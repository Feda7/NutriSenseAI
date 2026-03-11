const express = require("express");
const router = express.Router();

const dietController = require("../controllers/diet.controller");

router.get("/", dietController.getDiets);
router.post("/", dietController.addDiet);
router.delete("/:id", dietController.deleteDiet);

module.exports = router;