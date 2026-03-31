import { getEventById,createEvent,getEvents,updateEvent,deleteEvent } from "../controllers/event.controller.js";
import express from "express";

const router = express.Router();

router.post("/events", createEvent);
router.get("/events", getEvents);
router.get("/events/:id", getEventById);
router.put("/events/:id", updateEvent);
router.delete("/events/:id", deleteEvent);

export default router;