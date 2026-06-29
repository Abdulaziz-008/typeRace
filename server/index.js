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
    "The quick brown fox jumps over the lazy dog near the river bank every single morning without fail.",
    "To be or not to be, that is the question. Whether tis nobler in the mind to suffer the slings and arrows of outrageous fortune.",
    "All that glitters is not gold. Often have you heard that told. Many a man his life hath sold but my outside to behold.",
    "In the beginning God created the heavens and the earth. The earth was without form and void, and darkness was over the face of the deep.",
    "Success is not final, failure is not fatal. It is the courage to continue that counts. Never give up on your goals and dreams.",
    "The only way to do great work is to love what you do. Stay hungry, stay foolish. Keep pushing forward even when things get hard.",
    "Life is what happens when you are busy making other plans. Enjoy the little things because one day you will look back and realize they were the big things.",
    "It does not matter how slowly you go as long as you do not stop moving forward. Every step you take brings you closer to your destination.",
    "Believe you can and you are halfway there. Hard work beats talent when talent does not work hard. Consistency is the key to success.",
    "The future belongs to those who believe in the beauty of their dreams. Work hard every day and never stop learning new things.",
    "Reading books opens up new worlds and perspectives. Knowledge gained from books helps us understand life and the people around us better.",
    "Technology has changed the way we live, work, and communicate with each other. The internet connects billions of people across the globe every day."
  ],
  uz: [
    "Tez yuguruvchi jigarrang tulki dangasa itning ustidan sakrab o'tdi va uzoqqa ketdi. Hayot qisqa, san'at abadiy va go'zaldir.",
    "Bilim olish har bir musulmon erkak va ayol uchun farzdir. Ilm izlash uchun Xitoyga ham boring, chunki ilm — eng katta boylik.",
    "O'zbek xalqi qadimdan mehmondo'st va bag'rikeng xalq bo'lib kelgan. Biz kelajakka ishonch bilan qaraymiz va yurtimizni sevamiz.",
    "Vatan tuproqi oltindan qimmat. Ona tilimiz bizning eng katta boyligimizdir. Tilni asrang, ardoqlang va avlodlarga yetkazing.",
    "Kitob bilim manbaidir. Ko'p o'qigan kishi ko'p biladi va hayotda muvaffaqiyatga erishadi. Har kuni kamida bir soat kitob o'qing.",
    "Mehnat qilsang, maqsadingga yetasan. Qiynalmasdan erishilgan narsa qadrlanmaydi. Harakat qil, sabr qil, natija o'z-o'zidan keladi.",
    "Do'st achitib gapirar, dushman kuldirib. Haqiqiy do'st qiyinchilikda bilinadi va hech qachon yolg'iz qoldirmaydi seni.",
    "Sabr qilgan murodiga yetgan. Ishonch bilan harakat qil, natija albatta bo'ladi. Hech narsadan umidsizlanma va oldinga qarab yur.",
    "Yoshlik bir marta keladi, uni behuda ketkazma. Har kuni yangi narsa o'rgan va o'zingni rivojlantir. Vaqt qaytmaydi.",
    "El uchun yasha, el seni ulug'laydi. Yaxshilik qil, daryoga tashla, baliq bilmasa ham xoliq biladi. Ezgulik yo'lidan borgin.",
    "Ilm va bilim insonga qanotdir. O'qish va o'rganish orqali biz dunyo sirlarini kashf etamiz va hayotni yanada yaxshi tushunib olamiz.",
    "O'zbekiston go'zal va boy tarixga ega mamlakat. Samarqand, Buxoro va Xiva shaharlari dunyo sivilizatsiyasining beshtagi hisoblanadi."
  ],
  ru: [
    "Быстрая коричневая лиса прыгает через ленивую собаку у реки каждое утро. Жизнь прекрасна и удивительна во всех своих проявлениях.",
    "Москва слезам не верит. В гостях хорошо а дома лучше. Без труда не вытащишь рыбку из пруда и не добьёшься успеха в жизни.",
    "Россия великая страна с богатой историей и культурой. Мы гордимся нашим прошлым и верим в светлое и прекрасное будущее.",
    "Читайте книги они открывают новые миры и горизонты. Знание — сила. Учиться никогда не поздно для любого человека в любом возрасте.",
    "Терпение и труд всё перетрут. Кто рано встаёт тому Бог подаёт удачу и везение во всех делах и начинаниях.",
    "Дорогу осилит идущий. Не бойся идти медленно, бойся стоять на месте и не двигаться вперёд к своей мечте.",
    "Друг познаётся в беде. Настоящая дружба проверяется временем и трудными жизненными ситуациями которые случаются с каждым из нас.",
    "Лучше поздно чем никогда. Главное начать действовать и не останавливаться на пути к своей заветной цели в жизни.",
    "Слово не воробей, вылетит не поймаешь. Думай прежде чем говорить, ведь слова могут ранить сильнее любого оружия.",
    "Нет ничего невозможного для человека с сильным желанием, упорным трудом и непоколебимой верой в собственные силы и возможности.",
    "Книга — лучший подарок и лучший друг человека. Читая хорошие книги мы становимся умнее, добрее и мудрее день за днём.",
    "Природа России необычайно красива и разнообразна. От тайги Сибири до степей юга страна хранит несметные природные богатства."
  ],
  de: [
    "Der schnelle braune Fuchs springt jeden Morgen über den faulen Hund am Flussufer. Das Leben ist schön und wunderbar in all seinen Facetten.",
    "Deutsch ist eine schöne Sprache mit langer Geschichte und reicher Kultur. Lernen macht Spaß wenn man es richtig und mit Begeisterung angeht.",
    "Übung macht den Meister. Wer viel und ausdauernd arbeitet wird auch viel erreichen in seinem Leben und beruflichen Werdegang.",
    "Der frühe Vogel fängt den Wurm. Fleiß und Ausdauer führen zum Erfolg im Leben. Gib niemals auf und glaube immer an dich selbst.",
    "Deutschland ist ein Land mit reicher Geschichte, Kultur und Wissenschaft. Viele große Denker und Erfinder kamen aus diesem wunderschönen Land.",
    "Lesen bildet den Menschen und öffnet neue Horizonte. Wer viele Bücher liest entwickelt ein tiefes Verständnis für die Welt und ihre Zusammenhänge."
  ],
  fr: [
    "Le rapide renard brun saute par-dessus le chien paresseux près de la rivière chaque matin. La vie est belle et merveilleuse dans toute sa splendeur.",
    "La France est un beau pays avec une longue histoire et une culture riche. Paris est la ville de l'amour, de la lumière et de la gastronomie.",
    "La pratique rend parfait. Celui qui travaille dur et avec persévérance atteindra certainement ses objectifs dans la vie quotidienne.",
    "Le courage c'est de savoir avoir peur et d'aller de l'avant malgré tout. Ne jamais abandonner ses rêves et continuer à avancer chaque jour.",
    "La lecture est une fenêtre ouverte sur le monde. Les livres nous permettent de voyager sans bouger et d'apprendre sans limites ni frontières.",
    "La langue française est parlée par des millions de personnes sur tous les continents. C'est une langue riche en nuances et en expressions poétiques."
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
