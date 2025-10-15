import { Router } from "express";
import {
  page,
  getCalendar,
  createBooking,
  seedMonth,
  getRooms,
  bookRoom,
  updateRoomLock,
  cancelBooking,
} from "../controllers/hotelController.js";

const router = Router();

// ====== FRONTEND PAGE ======
router.get("/hotel/:slug", page);

// ====== APIs ======
router.get("/api/hotels/:code/calendar", getCalendar);
router.get("/api/hotels/:code/rooms", getRooms);
router.post("/api/hotels/:code/book", createBooking);
router.get("/api/hotels/:code/seed-month", seedMonth);
router.post("/api/hotels/:code/book-room", bookRoom);

// ====== ADMIN ======
router.post("/api/admin/lock-room", updateRoomLock);

// ====== CANCEL BOOKING ======
router.post("/cancel-booking", cancelBooking);
router.post("/api/cancel-booking", cancelBooking);

export default router;
