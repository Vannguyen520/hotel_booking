import { pool } from "../db.js";
import express from "express";
const router = express.Router();

// =================== PAGE ===================
export async function page(req, res) {
  const code = (req.query.hotel_code || "").trim();
  if (!code) return res.status(400).send("Missing hotel_code");

  const [rows] = await pool.query("SELECT * FROM hotels WHERE code=?", [code]);
  if (rows.length === 0) return res.status(404).send("Hotel not found");

  const hotel = rows[0];
  res.render("hotel", { hotel });
}

// =================== CALENDAR ===================
export async function getCalendar(req, res) {
  try {
    const code = req.params.code;
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month) || new Date().getMonth() + 1;
    const rooms = Number(req.query.rooms || 1);

    // Lấy hotel_id
    const [h] = await pool.query("SELECT id FROM hotels WHERE code=?", [code]);
    if (!h.length) return res.status(404).json({ error: "Hotel not found" });
    const hotelId = h[0].id;

    // Truy vấn lịch
    const [rows] = await pool.query(
      `SELECT day, MIN(price) AS min_price, SUM(available) AS total_available
       FROM rooms
       WHERE hotel_id = ?
         AND day IS NOT NULL
         AND (YEAR(day) = ? OR YEAR(day) = ?)
         AND (MONTH(day) = ? OR MONTH(day) = ?)
       GROUP BY day
       ORDER BY day ASC`,
      [
        hotelId,
        year,
        month === 12 ? year + 1 : year,
        month,
        month === 12 ? 1 : month + 1,
      ]
    );

    // Map dữ liệu an toàn
    const map = {};
    rows.forEach((r) => {
      if (!r.day) return; // tránh lỗi null

      const key =
        typeof r.day === "string"
          ? r.day.slice(0, 10)
          : `${r.day.getFullYear()}-${String(r.day.getMonth() + 1).padStart(
              2,
              "0"
            )}-${String(r.day.getDate()).padStart(2, "0")}`;

      map[key] = {
        price: Number(r.min_price || 0),
        available: Number(r.total_available || 0) >= rooms,
      };
    });

    res.json({
      ok: true,
      hotel_code: code,
      months: [
        buildMonth(year, month, map),
        buildMonth(
          month === 12 ? year + 1 : year,
          month === 12 ? 1 : month + 1,
          map
        ),
      ],
    });
  } catch (e) {
    console.error("getCalendar error:", e);
    res.status(500).json({ error: "Internal error" });
  }
}


// =================== CREATE BOOKING ===================
export async function createBooking(req, res) {
  const conn = await pool.getConnection();
  try {
    const code = req.params.code;
    const {
      guest_name,
      guest_email,
      checkin,
      checkout,
      rooms = 1,
      currency = "VND",
    } = req.body;

    if (!guest_name || !checkin || !checkout) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const ci = new Date(checkin);
    const co = new Date(checkout);
    const nights = Math.ceil((co - ci) / (1000 * 60 * 60 * 24));
    if (nights <= 0)
      return res.status(400).json({ error: "Invalid date range" });

    await conn.beginTransaction();

    const [h] = await conn.query(
      "SELECT id FROM hotels WHERE code=? FOR UPDATE",
      [code]
    );
    if (!h.length) throw new Error("Hotel not found");
    const hotelId = h[0].id;


    // 🔹 Lấy 1 phòng còn trống để gán room_id (đảm bảo mỗi đặt phòng có liên kết)
    const [availableRoom] = await conn.query(
      "SELECT id, price FROM rooms WHERE hotel_id=? AND available > 0 AND is_locked=0 LIMIT 1",
      [hotelId]
    );
    if (!availableRoom.length)
      return res.status(400).json({ error: "Không còn phòng trống để đặt" });

    const roomId = availableRoom[0].id;
    const price = Number(availableRoom[0].price) || 0;
    const total = price * nights * rooms;

    // 🔹 Ghi cả room_id vào bảng bookings
    const [ins] = await conn.query(
      `INSERT INTO bookings (hotel_id, room_id, guest_name, guest_email, checkin, checkout, rooms, total_price, currency, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'booked')`,
      [
        hotelId,
        roomId,
        guest_name,
        guest_email || null,
        checkin,
        checkout,
        rooms,
        total,
        currency,
      ]
    );

// 🔹 Giảm available phòng đã chọn
await conn.query("UPDATE rooms SET available = available - 1 WHERE id=?", [roomId]);


    await conn.commit();
    res.json({
      ok: true,
      booking_id: ins.insertId,
      total_price: total,
      nights,
      price_per_night: price,
    });
  } catch (e) {
    console.error(e);
    try {
      await conn.rollback();
    } catch {}
    res.status(500).json({ error: "Booking failed" });
  } finally {
    conn.release();
  }
}

// =================== SEED ROOMS ===================
export async function seedMonth(req, res) {
  try {
    const code = req.params.code;
    const year = 2025; // ← thêm
    const month = 10;  // ← thêm
    const weekdayPrice = 1000000;
    const weekendPrice = 1600000;
    const capacity = 2;
    const available = 5;


    const [h] = await pool.query("SELECT id FROM hotels WHERE code=?", [code]);
    if (!h.length) return res.status(404).json({ error: "Hotel not found" });
    const hotelId = h[0].id;

    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 0));
    const rows = [];

    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      const dow = d.getUTCDay();
      const isWeekend = dow === 0 || dow === 6;
      const price = isWeekend ? weekendPrice : weekdayPrice;
      rows.push([
        hotelId,
        toSQLDate(d),
        `Standard Room ${d.getUTCDate()}`,
        `Phòng tiêu chuẩn ngày ${d.getUTCDate()}`,
        `https://picsum.photos/300/200?random=${d.getUTCDate()}`,
        price,
        capacity,
        available,
        0, // is_locked
        null, // lock_reason
      ]);
    }

    await pool.query(
      `INSERT INTO rooms (hotel_id, day, name, description, image, price, capacity, available, is_locked, lock_reason)
       VALUES ?`,
      [rows]
    );

    res.json({ ok: true, inserted: rows.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "seed error" });
  }
}

// =================== GET ROOMS ===================
export async function getRooms(req, res) {
  try {
    const code = req.params.code;
    const { checkin, checkout } = req.query;

    // 🔹 Lấy id khách sạn từ code
    const [h] = await pool.query("SELECT id FROM hotels WHERE code=?", [code]);
    if (!h.length)
      return res.status(404).json({ ok: false, message: "Hotel not found" });
    const hotelId = h[0].id;

    // 🔹 Tính số đêm
    const nights = Math.max(
      1,
      Math.round(
        (new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24)
      )
    );

    // 🔹 Truy vấn danh sách phòng
    const [rows] = await pool.query(
      `
      SELECT 
        r.id, 
        r.name, 
        r.image, 
        r.price, 
        r.available, 
        r.is_locked, 
        r.lock_reason,
        r.day,
        b.id AS booking_id,
        b.status AS booking_status,
        b.checkin,
        b.checkout
      FROM rooms r
      LEFT JOIN bookings b
        ON b.room_id = r.id
        AND b.hotel_id = r.hotel_id
        AND b.status = 'booked'
        AND (b.checkin <= ? AND b.checkout >= ?)
      WHERE r.hotel_id = ?
        AND r.day BETWEEN ? AND ?
      ORDER BY r.id ASC
      `,
      [checkout, checkin, hotelId, checkin, checkout] // 🟢 5 tham số
    );

    // 🔹 Chuyển dữ liệu
    const data = rows.map((r) => ({
      id: r.id,
      name: r.name,
      image: r.image,
      price: Number(r.price) || 0,
      total: (Number(r.price) || 0) * nights,
      available: r.available,
      is_locked: r.is_locked === 1,
      lock_reason: r.lock_reason,
      is_booked: r.booking_status === "booked",
      booking_id: r.booking_id,
    }));

    console.log("📦 getRooms result sample:", data.slice(0, 3));
    res.json({ ok: true, nights, rooms: data });
  } catch (err) {
    console.error("❌ Lỗi getRooms:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
}


// =================== BOOK ROOM ===================
export async function bookRoom(req, res) {
  try {
    const code = req.params.code;
    const { room_id, checkin, checkout, guest_name, guest_email } = req.body;

    const [h] = await pool.query("SELECT id FROM hotels WHERE code=?", [code]);
    if (!h.length)
      return res.status(404).json({ ok: false, message: "Hotel not found" });
    const hotelId = h[0].id;

    const [rooms] = await pool.query(
      "SELECT available, price, is_locked FROM rooms WHERE id=? AND hotel_id=?",
      [room_id, hotelId]
    );
    if (!rooms.length)
      return res.status(404).json({ ok: false, message: "Room not found" });

    const room = rooms[0];
    if (room.is_locked)
      return res.json({ ok: false, message: "Phòng đang bị khóa!" });
    if (room.available <= 0)
      return res.json({ ok: false, message: "Phòng đã hết!" });

    const ci = new Date(checkin);
    const co = new Date(checkout);
    const nights = Math.round((co - ci) / (1000 * 60 * 60 * 24));
    const total = room.price * nights;

    await pool.query(
      `INSERT INTO bookings (hotel_id, room_id, guest_name, guest_email, checkin, checkout, price, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'booked')`,
      [
        hotelId,
        room_id,
        guest_name,
        guest_email,
        checkin,
        checkout,
        room.price,
        total,
      ]
    );

    await pool.query(`UPDATE rooms SET available = available - 1 WHERE id = ?`, [
      room_id,
    ]);

    res.json({
      ok: true,
      message: "Đặt phòng thành công!",
      total_price: total,
      nights,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
}

// =================== UPDATE ROOM LOCK ===================
export async function updateRoomLock(req, res) {
  try {
    const { room_id, is_locked, reason } = req.body;
    if (!room_id)
      return res.status(400).json({ ok: false, message: "Thiếu room_id" });

    await pool.query(
      "UPDATE rooms SET is_locked = ?, lock_reason = ? WHERE id = ?",
      [is_locked ? 1 : 0, reason || null, room_id]
    );

    res.json({ ok: true, message: "Cập nhật trạng thái phòng thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Lỗi hệ thống" });
  }
}

// =================== CANCEL BOOKING ===================
export const cancelBooking = async (req, res) => {
  const { bookingId } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Lấy room_id trước
    const [rows] = await conn.query(
      "SELECT room_id FROM bookings WHERE id = ? AND status = 'booked'",
      [bookingId]
    );
    if (!rows.length) {
      await conn.rollback();
      return res.json({ success: false, message: "Không tìm thấy đặt phòng đang hoạt động." });
    }

    const roomId = rows[0].room_id;

    // Cập nhật booking -> cancelled
    await conn.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [bookingId]);

    // Tăng lại số phòng khả dụng
    await conn.query("UPDATE rooms SET available = available + 1 WHERE id = ?", [roomId]);

    await conn.commit();
    res.json({ success: true, message: "Hủy phòng thành công!" });
  } catch (err) {
    console.error("❌ Lỗi khi hủy phòng:", err);
    await conn.rollback();
    res.status(500).json({ success: false, message: "Lỗi server!" });
  } finally {
    conn.release();
  }
};


// =================== HELPERS ===================
function toSQLDate(d) {
  return d.toISOString().slice(0, 10);
}

function buildMonth(year, month, map) {
  const days = [];
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
    const info = map[key] || { price: null, available: false };
    days.push({ date: key, ...info });
  }
  return { year, month, days };
}

