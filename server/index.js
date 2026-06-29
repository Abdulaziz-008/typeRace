const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const rooms = {}; // roomId -> { players, text, started, countdown }

const TEXTS = {
  en: [
    "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.",
    "To be or not to be, that is the question. Whether tis nobler in the mind to suffer.",
    "All that glitters is not gold. Often have you heard that told. Many a man his life hath sold.",
    "In the beginning God created the heavens and the earth. The earth was without form and void.",
    "Success is not final, failure is not fatal. It is the courage to continue that counts.",
    "The only way to do great work is to love what you do. Stay hungry, stay foolish.",
    "Life is what happens when you are busy making other plans. Enjoy the little things.",
    "It does not matter how slowly you go as long as you do not stop moving forward.",
    "Believe you can and you are halfway there. Hard work beats talent when talent does not work hard.",
    "The future belongs to those who believe in the beauty of their dreams."
  ],
  uz: [
    "Tez yuguruvchi jigarrang tulki dangasa itning ustidan sakrab o'tdi. Hayot qisqa, san'at abadiy.",
    "Bilim olish har bir musulmon erkak va ayol uchun farzdir. Ilm izlash uchun Xitoyga ham boring.",
    "O'zbek xalqi qadimdan mehmondo'st va bag'rikeng xalq bo'lib kelgan. Biz kelajakka ishonch bilan qaraymiz.",
    "Vatan tuproqi oltindan qimmat. Ona tilimiz bizning eng katta boyligimizdir. Tilni asrang, ardoqlang.",
    "Kitob bilim manbaidir. Ko'p o'qigan kishi ko'p biladi va hayotda muvaffaqiyatga erishadi.",
    "Mehnat qilsang, maqsadingga yetasan. Qiynalmasdan erishilgan narsa qadrlanmaydi.",
    "Do'st achitib gapirar, dushman kuldirib. Haqiqiy do'st qiyinchilikda bilinadi.",
    "Sabr qilgan murodiga yetgan. Ishonch bilan harakat qil, natija albatta bo'ladi.",
    "Yoshlik bir marta keladi, uni behuda ketkazma. Har kuni yangi narsa o'rgan.",
    "El uchun yasha, el seni ulug'laydi. Yaxshilik qil, daryoga tashla, baliq bilmasa ham xoliq biladi."
  ],
  ru: [
    "Быстрая коричневая лиса прыгает через ленивую собаку. Жизнь прекрасна и удивительна.",
    "Москва слезам не верит. В гостях хорошо а дома лучше. Без труда не вытащишь рыбку из пруда.",
    "Россия великая страна с богатой историей и культурой. Мы гордимся нашим прошлым и верим в будущее.",
    "Читайте книги они открывают новые миры. Знание сила. Учиться никогда не поздно для любого человека.",
    "Терпение и труд всё перетрут. Кто рано встаёт тому Бог подаёт удачу и везение.",
    "Дорогу осилит идущий. Не бойся идти медленно бойся стоять на месте и не двигаться.",
    "Друг познаётся в беде. Настоящая дружба проверяется временем и трудными ситуациями.",
    "Лучше поздно чем никогда. Главное начать и не останавливаться на пути к своей цели.",
    "Слово не воробей, вылетит не поймаешь. Думай перед тем как говорить что-либо.",
    "Нет ничего невозможного для человека с сильным желанием и упорным трудом."
  ],
  de: [
    "Der schnelle braune Fuchs springt über den faulen Hund. Das Leben ist schön und wunderbar.",
    "Deutsch ist eine schöne Sprache mit langer Geschichte. Lernen macht Spaß wenn man es richtig angeht.",
    "Übung macht den Meister. Wer viel arbeitet wird auch viel erreichen in seinem Leben.",
    "Der frühe Vogel fängt den Wurm. Fleiß und Ausdauer führen zum Erfolg im Leben."
  ],
  fr: [
    "Le rapide renard brun saute par-dessus le chien paresseux. La vie est belle et merveilleuse.",
    "La France est un beau pays avec une longue histoire. Paris est la ville de l'amour et de la lumière.",
    "La pratique rend parfait. Celui qui travaille dur atteindra ses objectifs dans la vie.",
    "Le courage c'est de savoir avoir peur et d'aller de l'avant malgré tout."
  ]
};

function getRandomText(lang) {
  const list = TEXTS[lang] || TEXTS.en;
  return list[Math.floor(Math.random() * list.length)];
}

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create room
  socket.on('create_room', ({ username, lang }) => {
    const roomId = generateRoomId();
    const text = getRandomText(lang || 'en');
    rooms[roomId] = {
      id: roomId,
      text,
      lang: lang || 'en',
      started: false,
      players: {
        [socket.id]: { id: socket.id, username, progress: 0, wpm: 0, finished: false, finishTime: null }
      }
    };
    socket.join(roomId);
    socket.emit('room_created', { roomId, text, players: rooms[roomId].players });
    console.log(`Room ${roomId} created by ${username}`);
  });

  // Join room
  socket.on('join_room', ({ roomId, username }) => {
    const room = rooms[roomId];
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    if (room.started) {
      socket.emit('error', { message: 'Race already started' });
      return;
    }
    room.players[socket.id] = { id: socket.id, username, progress: 0, wpm: 0, finished: false, finishTime: null };
    socket.join(roomId);
    socket.emit('room_joined', { roomId, text: room.text, players: room.players });
    socket.to(roomId).emit('player_joined', { players: room.players });
    console.log(`${username} joined room ${roomId}`);
  });

  // Start race (countdown)
  socket.on('start_race', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || room.started) return;
    room.started = true;

    let count = 3;
    io.to(roomId).emit('countdown', { count });
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        io.to(roomId).emit('countdown', { count });
      } else {
        clearInterval(interval);
        io.to(roomId).emit('race_start', { text: room.text });
      }
    }, 1000);
  });

  // Player progress update
  socket.on('progress_update', ({ roomId, progress, wpm }) => {
    const room = rooms[roomId];
    if (!room || !room.players[socket.id]) return;
    room.players[socket.id].progress = progress;
    room.players[socket.id].wpm = wpm;
    io.to(roomId).emit('players_update', { players: room.players });
  });

  // Player finished
  socket.on('player_finished', ({ roomId, wpm, time }) => {
    const room = rooms[roomId];
    if (!room || !room.players[socket.id]) return;
    room.players[socket.id].finished = true;
    room.players[socket.id].wpm = wpm;
    room.players[socket.id].finishTime = time;
    room.players[socket.id].progress = 100;
    io.to(roomId).emit('players_update', { players: room.players });

    const allFinished = Object.values(room.players).every(p => p.finished);
    if (allFinished) {
      const sorted = Object.values(room.players).sort((a, b) => (a.finishTime || 9999) - (b.finishTime || 9999));
      io.to(roomId).emit('race_finished', { results: sorted });
    }
  });

  // Solo practice — get text
  socket.on('get_text', ({ lang }) => {
    socket.emit('text_result', { text: getRandomText(lang || 'en') });
  });

  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      if (room.players[socket.id]) {
        delete room.players[socket.id];
        socket.to(roomId).emit('players_update', { players: room.players });
        if (Object.keys(room.players).length === 0) {
          delete rooms[roomId];
        }
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
