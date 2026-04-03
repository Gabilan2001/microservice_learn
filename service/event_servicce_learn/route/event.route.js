import { getEventById,createEvent,getEvents,updateEvent,deleteEvent } from "../controllers/event.controller.js";
import express from "express";
import verifyUser from "../middleware/verifyUser.js";

const router = express.Router();

router.post("/events", verifyUser, createEvent);
router.get("/events", getEvents);
router.get("/events/:id", getEventById);
router.put("/events/:id", verifyUser, updateEvent);
router.delete("/events/:id", verifyUser, deleteEvent);

export default router;