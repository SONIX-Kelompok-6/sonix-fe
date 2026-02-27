# 1. Pakai Node.js versi 24 (Alpine = versi ringan)
FROM node:24-alpine

# 2. Install Bun secara global di dalam container Docker
RUN npm install -g bun

# 3. Bikin folder kerja di dalam container
WORKDIR /app

# 4. Copy package.json dan file lock milik Bun (bun.lock atau bun.lockb)
# Tanda bintang (*) biar ga error misal file lock-nya belum kebuat
COPY package.json bun.lock* bun.lockb* ./

# 5. Install semua library pakai Bun (super ngebut)
RUN bun install

# 6. Copy seluruh sisa kodingan React lu
COPY . .

# 7. Buka port 5173 (Port default Vite)
EXPOSE 5173

# 8. Jalankan Vite menggunakan Bun, buka akses host biar bisa diakses dosen
CMD ["bun", "run", "dev", "--host"]