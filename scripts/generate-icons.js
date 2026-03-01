#!/usr/bin/env node
// Generates PWA icons as solid emerald (#10b981) PNG squares.
// Pure Node.js — no external dependencies.

import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// CRC32 lookup table
const CRC_TABLE = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
  }
  CRC_TABLE[i] = c >>> 0
}

function crc32(buf) {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function makeChunk(type, data) {
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcVal = crc32(Buffer.concat([typeBuf, data]))
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crcVal, 0)
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf])
}

function createPNG(size, r, g, b) {
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR: width, height, bit depth 8, color type 2 (RGB)
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 2  // RGB
  ihdr[10] = 0 // compression
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // interlace

  // Raw pixel data: filter byte (0 = None) + RGB per row
  const rowSize = 1 + size * 3
  const raw = Buffer.alloc(size * rowSize)
  for (let y = 0; y < size; y++) {
    const base = y * rowSize
    raw[base] = 0 // filter: None
    for (let x = 0; x < size; x++) {
      raw[base + 1 + x * 3] = r
      raw[base + 2 + x * 3] = g
      raw[base + 3 + x * 3] = b
    }
  }

  const idat = deflateSync(raw)

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', Buffer.alloc(0)),
  ])
}

const publicDir = join(__dirname, '..', 'public')
mkdirSync(publicDir, { recursive: true })

// Emerald #10b981 = rgb(16, 185, 129)
for (const size of [192, 512]) {
  const png = createPNG(size, 16, 185, 129)
  writeFileSync(join(publicDir, `pwa-${size}x${size}.png`), png)
  console.log(`✓  public/pwa-${size}x${size}.png (${size}x${size}px, ${png.length} bytes)`)
}
