import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import hotelRoutes from "./routes/hotelRoutes.js";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(path.join(__dirname, "src/public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// 🟩 ĐẶT prefix cho tất cả route là /booking
app.use("/booking", hotelRoutes);

// 🟩 Chỉ redirect khi người dùng vào /booking/
app.get("/booking", (_req, res) => {
  res.redirect("/booking/hotel/BeHome?hotel_code=537T72");
});

app.get("/booking/check", (req, res) => {
  res.render("check", {
    checkin: req.query.checkin,
    checkout: req.query.checkout,
    rooms: req.query.rooms,
  });
});


const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => console.log(`✅ Node server: http://localhost:${PORT}`));

// Khi truy cập http://localhost:3000/
app.get("/", (req, res) => {
  res.redirect("/booking/hotel/BeHome?hotel_code=537T72");
});
