import { Router } from "express";
import { createLeadController,updateLeadStatusController,getLeadsByStatusController } from "../controllers/lead.controller.js";

export const leadRouter = Router();


// POST /leads
leadRouter.post('/',createLeadController);


// GET /leads
// GET /leads?status=NEW
leadRouter.get('/',getLeadsByStatusController);


// PATCH /leads/123
leadRouter.patch('/:id',updateLeadStatusController);
