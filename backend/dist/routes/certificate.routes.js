"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const certificate_controller_1 = require("../controllers/certificate.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Rota restrita ao participante logado para baixar seu proprio certificado
router.get('/:eventId', auth_middleware_1.authenticateToken, certificate_controller_1.certificateController.generate);
exports.default = router;
