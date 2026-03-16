"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const company_controller_1 = require("../controllers/company.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Todas as rotas de empresa precisam do login Gov Br
router.post('/', auth_middleware_1.authenticateToken, company_controller_1.companyController.create);
router.get('/', auth_middleware_1.authenticateToken, company_controller_1.companyController.list);
exports.default = router;
