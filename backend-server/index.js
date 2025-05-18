// backend-server/index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/system_monitor";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const machineSchema = new mongoose.Schema({
  machine_id: String,
  os: String,
  disk_encrypted: Boolean,
  os_up_to_date: Boolean,
  antivirus_enabled: Boolean,
  sleep_setting_ok: Boolean,
  timestamp: Date,
});

const MachineStatus = mongoose.model("MachineStatus", machineSchema);

// POST /api/report
app.post("/api/report", async (req, res) => {
  try {
    console.log("Incoming report:", req.body); 
    const newStatus = new MachineStatus(req.body);
    await newStatus.save();
    res.status(201).json({ message: "Status saved." });
  } catch (err) {
    console.error("Error saving report:", err);
    res.status(500).json({ error: "Failed to save data." });
  }
});

// GET /api/machines
app.get("/api/machines", async (req, res) => {
  try {
    const latest = await MachineStatus.aggregate([
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: "$machine_id",
          doc: { $first: "$$ROOT" }
        }
      }
    ]);
    res.json(latest.map(entry => entry.doc));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch machines." });
  }
});

// GET /api/machines/filter?os=Windows&issue=true
app.get("/api/machines/filter", async (req, res) => {
  try {
    const { os, issue } = req.query;
    const latest = await MachineStatus.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$machine_id",
          doc: { $first: "$$ROOT" }
        }
      }
    ]);

    let filtered = latest.map(e => e.doc);
    if (os) filtered = filtered.filter(e => e.os === os);
    if (issue === "true") {
      filtered = filtered.filter(e =>
        !e.disk_encrypted ||
        !e.os_up_to_date ||
        !e.antivirus_enabled ||
        !e.sleep_setting_ok
      );
    }

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: "Filtering failed." });
  }
});

// GET /api/export (CSV export)
app.get("/api/export", async (req, res) => {
  try {
    const all = await MachineStatus.find({}).sort({ timestamp: -1 });
    const csv = [
      ["Machine ID", "OS", "Disk Encrypted", "OS Up To Date", "Antivirus Enabled", "Sleep OK", "Timestamp"],
      ...all.map(e => [
        e.machine_id,
        e.os,
        e.disk_encrypted,
        e.os_up_to_date,
        e.antivirus_enabled,
        e.sleep_setting_ok,
        e.timestamp.toISOString(),
      ])
    ].map(row => row.join(",")).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=export.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: "Export failed." });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
