"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = require("../controllers/event.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Adicionando a validação do GOV BR (authenticateToken) nos endpoints
router.post('/', auth_middleware_1.authenticateToken, event_controller_1.eventController.create);
router.get('/', auth_middleware_1.authenticateToken, event_controller_1.eventController.list);
router.get('/:id', auth_middleware_1.authenticateToken, event_controller_1.eventController.getById);
exports.default = router;
