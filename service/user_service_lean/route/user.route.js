import { Router } from "express";
import { registerUserController, verifyEmailController } from "../controllers/user.controller.js";

const router = Router();

router.post("/register",registerUserController)

router.post("/verify-email",verifyEmailController)
export default router;