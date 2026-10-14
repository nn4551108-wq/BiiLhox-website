
require("dotenv").config();

const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    apiKeyConfigured: Boolean(process.env.ROBLOX_API_KEY)
  });
});

app.post("/api/assets/upload", upload.single("file"), async (req, res) => {
  try {
    const apiKey = process.env.ROBLOX_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: "API Key belum diatur di environment server."
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "File belum dipilih."
      });
    }

    const { targetType, creatorId, assetType, displayName, description = "" } = req.body;

    if (!["user", "group"].includes(targetType)) {
      return res.status(400).json({ error: "Target tidak valid." });
    }

    if (!/^\d+$/.test(String(creatorId || ""))) {
      return res.status(400).json({ error: "Creator ID harus berupa angka." });
    }

    const allowedTypes = [
      "Decal",
      "Audio",
      "Model",
      "Animation",
      "Video"
    ];

    if (!allowedTypes.includes(assetType)) {
      return res.status(400).json({ error: "Jenis aset tidak valid." });
    }

    if (!displayName || !displayName.trim()) {
      return res.status(400).json({ error: "Nama aset wajib diisi." });
    }

    const extension = path.extname(req.file.originalname).toLowerCase();

    const allowedExtensions = {
      Decal: [".png", ".jpg", ".jpeg", ".bmp", ".tga"],
      Audio: [".mp3", ".ogg", ".wav", ".flac"],
      Model: [".fbx", ".gltf", ".glb", ".rbxm", ".rbxmx"],
      Animation: [".rbxm", ".rbxmx"],
      Video: [".mp4", ".mov"]
    };

    if (!allowedExtensions[assetType].includes(extension)) {
      return res.status(400).json({
        error: "Format file tidak cocok dengan jenis aset."
      });
    }

    const metadata = {
      assetType,
      displayName: displayName.trim().slice(0, 50),
      description: String(description).slice(0, 1000),
      creationContext: {
        creator: targetType === "group"
          ? { groupId: String(creatorId) }
          : { userId: String(creatorId) }
      }
    };

    const form = new FormData();
    form.append("request", JSON.stringify(metadata));
    form.append(
      "fileContent",
      new Blob([req.file.buffer], {
        type: req.file.mimetype || "application/octet-stream"
      }),
      req.file.originalname
    );

    const response = await fetch(
      "https://apis.roblox.com/assets/v1/assets",
      {
        method: "POST",
        headers: { "x-api-key": apiKey },
        body: form
      }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        error: result.message || result.error ||
          "Roblox menolak permintaan upload."
      });
    }

    res.json({
      ok: true,
      operationPath: result.path || null,
      message: "Permintaan upload dikirim ke Roblox Open Cloud."
    });
  } catch (error) {
    console.error("Upload failed:", error.message);

    res.status(500).json({
      error: "Terjadi kesalahan saat memproses upload."
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`BiiLHOX Studio berjalan di port ${port}`);
});
