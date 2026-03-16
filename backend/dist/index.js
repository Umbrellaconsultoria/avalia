"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const event_routes_1 = __importDefault(require("./routes/event.routes"));
const company_routes_1 = __importDefault(require("./routes/company.routes"));
const evaluation_routes_1 = __importDefault(require("./routes/evaluation.routes"));
const certificate_routes_1 = __importDefault(require("./routes/certificate.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Main Routes
app.use('/api/events', event_routes_1.default);
app.use('/api/companies', company_routes_1.default);
app.use('/api/evaluations', evaluation_routes_1.default);
app.use('/api/certificates', certificate_routes_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
