import { pool } from "./db.js";

async function seedFullPrice() {
  const hotelId = 1;
  const start = new Date("2025-10-01");
  const end = new Date("2025-11-30");

  const inserts = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dayStr = `${yyyy}-${mm}-${dd}`;

    const dow = d.getDay();
    let price = 1000000;
    if (dow === 5) price = 1600000;
    else if (dow === 6) price = 1400000;
    else if (dow === 0) price = 1500000;

    inserts.push([hotelId, dayStr, price, 2]);
  }

  console.log(`Xoá dữ liệu cũ...`);
  await pool.query("DELETE FROM daily_prices WHERE hotel_id = ?", [hotelId]);

  console.log(`Thêm ${inserts.length} dòng mới...`);
  await pool.query(
    "INSERT INTO daily_prices (hotel_id, day, price, capacity) VALUES ?",
    [inserts]
  );

  console.log("Hoàn tất seed dữ liệu giá cho 2 tháng!");
  process.exit(0);
}

seedFullPrice().catch((err) => {
  console.error(err);
  process.exit(1);
});
