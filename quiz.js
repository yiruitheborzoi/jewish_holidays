/*
  quiz.js

  Provides the quiz functionality on the dedicated quiz page. A list of
  multiple‑choice questions is presented sequentially. When the user
  answers correctly, a pleasant chime is played. At the end of the
  quiz, the total score is displayed. The nav toggle is also wired up
  for mobile responsiveness.
*/

document.addEventListener('DOMContentLoaded', () => {
  // Mobile navigation toggle
  const navToggle = document.querySelector('.nav-toggle');
  const header = document.querySelector('.header');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      header.classList.toggle('nav-open');
    });
  }

  // Audio element for correct answers
  const correctSound = document.getElementById('correct-sound');

  // Extended and shuffled quiz questions with hints and explanations
  const questions = [
    // Rosh Hashanah
    {
      category: 'Rosh Hashanah',
      question: 'Which holiday marks the Jewish New Year and begins the Ten Days of Repentance?',
      options: ['Rosh Hashanah', 'Yom Kippur', 'Hanukkah', 'Passover'],
      answer: 'Rosh Hashanah',
      hint: 'It literally means “head of the year”.',
      explanation: 'Rosh Hashanah is the Jewish New Year and ushers in the Ten Days of Repentance leading to Yom Kippur【76214460768755†L150-L161】.'
    },
    {
      category: 'Rosh Hashanah',
      question: 'What symbolic food is eaten on Rosh Hashanah to signify a sweet year?',
      options: ['Matzah', 'Latkes', 'Apples dipped in honey', 'Hamantaschen'],
      answer: 'Apples dipped in honey',
      hint: 'It is a fruit dipped in something sweet.',
      explanation: 'Dipping apples in honey symbolises the hope for a sweet new year【76214460768755†L162-L223】.'
    },
    {
      category: 'Rosh Hashanah',
      question: 'What instrument is traditionally sounded during Rosh Hashanah to awaken the soul?',
      options: ['Guitar', 'Piano', 'Shofar', 'Menorah'],
      answer: 'Shofar',
      hint: 'It is a ram’s horn.',
      explanation: 'The shofar, a ram’s horn, is blown on Rosh Hashanah to inspire repentance【76214460768755†L162-L223】.'
    },
    {
      category: 'Rosh Hashanah',
      question: 'Which round bread is eaten on Rosh Hashanah symbolising the cycle of the year?',
      options: ['Matzah', 'Challah', 'Pita', 'Babka'],
      answer: 'Challah',
      hint: 'It is a braided bread baked in a circle.',
      explanation: 'A round challah is eaten on Rosh Hashanah to symbolise the cyclical nature of the year【76214460768755†L162-L223】.'
    },
    {
      category: 'Rosh Hashanah',
      question: 'What ritual called “Tashlich” is performed on the afternoon of Rosh Hashanah?',
      options: ['Lighting candles', 'Casting bread crumbs into water', 'Planting trees', 'Reading the Torah'],
      answer: 'Casting bread crumbs into water',
      hint: 'Participants symbolically cast off their sins into a body of water.',
      explanation: 'Tashlich involves throwing bread into flowing water to symbolically cast off sins on Rosh Hashanah【76214460768755†L162-L223】.'
    },
    // Yom Kippur
    {
      category: 'Yom Kippur',
      question: 'Yom Kippur occurs how many days after Rosh Hashanah?',
      options: ['10 days', '7 days', '15 days', '21 days'],
      answer: '10 days',
      hint: 'It falls on the tenth day of the month.',
      explanation: 'Yom Kippur falls on the tenth day of Tishri, ten days after Rosh Hashanah【83978751782686†L294-L307】.'
    },
    {
      category: 'Yom Kippur',
      question: 'What is the primary purpose of Yom Kippur?',
      options: ['Celebration of the harvest', 'Purification through forgiveness and repentance', 'Commemoration of the Exodus', 'Thanking God for rain'],
      answer: 'Purification through forgiveness and repentance',
      hint: 'It is all about atoning for sins.',
      explanation: 'Yom Kippur is the Day of Atonement, dedicated to asking for forgiveness and purifying oneself through repentance【83978751782686†L294-L307】.'
    },
    {
      category: 'Yom Kippur',
      question: 'Yom Kippur is considered the most ______ of Jewish holidays.',
      options: ['Festive', 'Solemn', 'Fun', 'Agricultural'],
      answer: 'Solemn',
      hint: 'It is the holiest and most serious day.',
      explanation: 'Yom Kippur is the most solemn and holiest day in the Jewish calendar【83978751782686†L294-L307】.'
    },
    {
      category: 'Yom Kippur',
      question: 'Which practice is observed for approximately 25 hours on Yom Kippur?',
      options: ['Eating dairy foods', 'Fasting and refraining from work', 'Dancing with scrolls', 'Planting trees'],
      answer: 'Fasting and refraining from work',
      hint: 'Participants abstain from food and work.',
      explanation: 'On Yom Kippur, Jews fast and abstain from work and other pleasures for about 25 hours as part of the atonement process【83978751782686†L294-L307】.'
    },
    // Sukkot
    {
      category: 'Sukkot',
      question: 'Sukkot, also known as the Feast of Booths, lasts how many days according to the Torah?',
      options: ['1', '7', '8', '14'],
      answer: '7',
      hint: 'It is a week‑long festival.',
      explanation: 'Sukkot is a seven‑day festival starting on the 15th of Tishri【895426588592254†L253-L260】.'
    },
    {
      category: 'Sukkot',
      question: 'Sukkot commemorates the Israelites living in what type of dwelling in the wilderness?',
      options: ['Palaces', 'Caves', 'Huts (sukkot)', 'Boats'],
      answer: 'Huts (sukkot)',
      hint: 'It shares its name with the holiday.',
      explanation: 'During Sukkot, Jews dwell in temporary huts (sukkot) to recall the Israelites’ journey in the wilderness【895426588592254†L253-L260】.'
    },
    {
      category: 'Sukkot',
      question: 'Which four species are ritually waved on Sukkot?',
      options: ['Palm, myrtle, willow & citron', 'Olive, oak, fig & date', 'Wheat, barley, grapes & pomegranate', 'Apple, banana, pear & cherry'],
      answer: 'Palm, myrtle, willow & citron',
      hint: 'The set includes a palm branch and a citrus fruit.',
      explanation: 'The Four Species—palm (lulav), myrtle (hadass), willow (aravah) and citron (etrog)—are waved during Sukkot【895426588592254†L264-L304】.'
    },
    {
      category: 'Sukkot',
      question: 'Sukkot is both an agricultural harvest festival and a commemoration of what biblical event?',
      options: ['Creation', 'Destruction of the Temple', 'The Exodus and sojourn in the wilderness', 'Giving of the Torah'],
      answer: 'The Exodus and sojourn in the wilderness',
      hint: 'It relates to the Israelites’ journey from Egypt.',
      explanation: 'Sukkot has a dual significance: celebrating the autumn harvest and commemorating the Israelites’ journey through the wilderness after the Exodus【895426588592254†L253-L260】.'
    },
    // Shemini Atzeret
    {
      category: 'Shemini Atzeret',
      question: 'Shemini Atzeret occurs on which day relative to Sukkot?',
      options: ['First day', 'Fourth day', 'Seventh day', 'Eighth day'],
      answer: 'Eighth day',
      hint: 'Its name means “assembly of the eighth day”.',
      explanation: 'Shemini Atzeret literally means “Eighth Day of Assembly” and follows the seven days of Sukkot【704735248963246†L210-L252】.'
    },
    {
      category: 'Shemini Atzeret',
      question: 'Which memorial prayer is recited on Shemini Atzeret?',
      options: ['Hallel', 'Yizkor', 'Shema', 'Aleinu'],
      answer: 'Yizkor',
      hint: 'It is a prayer for the dead.',
      explanation: 'The Yizkor (memorial) prayer is recited on Shemini Atzeret【704735248963246†L238-L279】.'
    },
    {
      category: 'Shemini Atzeret',
      question: 'Which special prayer for the rainy season is introduced on Shemini Atzeret?',
      options: ['Prayer for sun', 'Prayer for rain', 'Prayer for harvest', 'Prayer for peace'],
      answer: 'Prayer for rain',
      hint: 'It asks for water.',
      explanation: 'On Shemini Atzeret Jews begin reciting the prayer for rain, signalling the start of the rainy season【704735248963246†L238-L279】.'
    },
    {
      category: 'Shemini Atzeret',
      question: 'Outside Israel, the second day of Shemini Atzeret is celebrated as which holiday?',
      options: ['Purim', 'Simchat Torah', 'Hanukkah', 'Tu BiShvat'],
      answer: 'Simchat Torah',
      hint: 'Its name means “Rejoicing with the Torah”.',
      explanation: 'In the diaspora, the second day of Shemini Atzeret is celebrated as Simchat Torah【704735248963246†L210-L252】.'
    },
    {
      category: 'Shemini Atzeret',
      question: 'How many sacrifices are offered on the eighth day according to tradition, compared to the seven days of Sukkot?',
      options: ['70 sacrifices then 70', '70 sacrifices then 13', '70 sacrifices then 1', 'None'],
      answer: '70 sacrifices then 1',
      hint: 'Sukkot had 70 sacrifices, Shemini Atzeret only one bull and one ram.',
      explanation: 'During Sukkot 70 sacrifices were offered representing the nations; on Shemini Atzeret only one bull and one ram were offered symbolising Israel’s special relationship with God【704735248963246†L226-L233】.'
    },
    // Simchat Torah
    {
      category: 'Simchat Torah',
      question: 'Simchat Torah celebrates what event in the annual Torah reading?',
      options: ['The start of Passover', 'The giving of the Torah at Sinai', 'The completion and restart of the Torah reading', 'The building of the Temple'],
      answer: 'The completion and restart of the Torah reading',
      hint: 'It marks finishing and beginning again.',
      explanation: 'Simchat Torah marks the completion and immediate restart of the annual Torah reading cycle【160491873661127†L50-L71】.'
    },
    {
      category: 'Simchat Torah',
      question: 'During Simchat Torah celebrations, people dance while carrying what around the synagogue?',
      options: ['Prayer books', 'Torah scrolls', 'Shofarot', 'Candles'],
      answer: 'Torah scrolls',
      hint: 'They are the central scrolls of Judaism.',
      explanation: 'On Simchat Torah participants dance with Torah scrolls in joyful processions around the synagogue【160491873661127†L50-L71】.'
    },
    {
      category: 'Simchat Torah',
      question: 'Simchat Torah falls on which day outside Israel?',
      options: ['15 Tishri', '22 Tishri', '23 Tishri', '25 Kislev'],
      answer: '23 Tishri',
      hint: 'It follows two days of Shemini Atzeret.',
      explanation: 'Outside Israel, Simchat Torah is celebrated on the second day of Shemini Atzeret, 23 Tishri【704735248963246†L210-L252】【160491873661127†L50-L71】.'
    },
    // Hanukkah
    {
      category: 'Hanukkah',
      question: 'Hanukkah commemorates the rededication of which building after the Maccabean revolt?',
      options: ['The First Temple', 'The Second Temple', 'The Tabernacle', 'The Western Wall'],
      answer: 'The Second Temple',
      hint: 'It was reclaimed from the Greeks.',
      explanation: 'Hanukkah celebrates the rededication of the Second Temple following the Maccabean revolt【317372544397867†L286-L301】.'
    },
    {
      category: 'Hanukkah',
      question: 'How many nights is Hanukkah celebrated?',
      options: ['7', '8', '9', '10'],
      answer: '8',
      hint: 'It is known as the festival of eight nights.',
      explanation: 'Hanukkah is celebrated for eight nights beginning on 25 Kislev【317372544397867†L286-L301】.'
    },
    {
      category: 'Hanukkah',
      question: 'What is the name of the nine‑branched candelabrum used during Hanukkah?',
      options: ['Menorah', 'Shofar', 'Mezuzah', 'Etrog'],
      answer: 'Menorah',
      hint: 'It holds nine candles.',
      explanation: 'A nine‑branched menorah (hanukkiah) is lit each night of Hanukkah, with one candle lit by a shammash helper candle【317372544397867†L286-L301】【317372544397867†L814-L833】.'
    },
    {
      category: 'Hanukkah',
      question: 'Which game involving a spinning top is traditionally played during Hanukkah?',
      options: ['Dreidel', 'Chess', 'Checkers', 'Dominoes'],
      answer: 'Dreidel',
      hint: 'It has four Hebrew letters on its sides.',
      explanation: 'The dreidel game is played during Hanukkah, with each side bearing a Hebrew letter forming an acronym for “A great miracle happened there”【317372544397867†L303-L312】.'
    },
    {
      category: 'Hanukkah',
      question: 'Which food is traditionally fried in oil and eaten during Hanukkah?',
      options: ['Matzah', 'Latkes', 'Hamantaschen', 'Kugel'],
      answer: 'Latkes',
      hint: 'They are potato pancakes.',
      explanation: 'Latkes (potato pancakes) and doughnuts (sufganiyot) are fried in oil to recall the miracle of the oil that burned for eight days【317372544397867†L303-L312】.'
    },
    {
      category: 'Hanukkah',
      question: 'Each night of Hanukkah, one additional candle is lit. What is the helper candle called?',
      options: ['Shammash', 'Etrog', 'Challah', 'Havdalah'],
      answer: 'Shammash',
      hint: 'It means “attendant”.',
      explanation: 'The shammash (attendant) candle is used to light the other Hanukkah candles【317372544397867†L814-L833】.'
    },
    // Tu BiShvat
    {
      category: 'Tu BiShvat',
      question: 'Tu BiShvat is celebrated on which day of the month of Shevat?',
      options: ['1st', '10th', '15th', '20th'],
      answer: '15th',
      hint: 'The holiday name includes the Hebrew letters for 15.',
      explanation: 'Tu BiShvat falls on the 15th day of Shevat, marking the New Year for Trees【911692274586522†L180-L185】.'
    },
    {
      category: 'Tu BiShvat',
      question: 'Tu BiShvat is popularly known as what?',
      options: ['Feast of Booths', 'New Year for Trees', 'Festival of Lights', 'Day of Atonement'],
      answer: 'New Year for Trees',
      hint: 'It celebrates nature.',
      explanation: 'Tu BiShvat is known as the New Year for Trees, an ecological awareness day【911692274586522†L180-L185】.'
    },
    {
      category: 'Tu BiShvat',
      question: 'Which 16th‑century Kabbalist introduced a fruit and wine seder for Tu BiShvat?',
      options: ['Rabbi Akiva', 'Rabbi Hillel', 'Rabbi Yitzchak Luria', 'Rabbi Mendel'],
      answer: 'Rabbi Yitzchak Luria',
      hint: 'He was a famous mystic in Safed.',
      explanation: 'Rabbi Yitzchak Luria instituted a Tu BiShvat seder with fruits and four cups of wine to bring spiritual perfection【911692274586522†L259-L267】.'
    },
    {
      category: 'Tu BiShvat',
      question: 'Modern Tu BiShvat celebrations often involve what activity?',
      options: ['Lighting candles', 'Planting trees', 'Fasting', 'Dancing with the Torah'],
      answer: 'Planting trees',
      hint: 'It is an eco‑friendly tradition.',
      explanation: 'In modern times, Tu BiShvat is celebrated with tree‑planting events to promote environmental stewardship【911692274586522†L285-L302】.'
    },
    // Purim
    {
      category: 'Purim',
      question: 'Purim commemorates the saving of the Jewish people from whose plot?',
      options: ['Pharaoh', 'Haman', 'Antiochus', 'Nebuchadnezzar'],
      answer: 'Haman',
      hint: 'He wore a three‑cornered hat.',
      explanation: 'Purim recalls how Queen Esther and Mordechai thwarted Haman’s plot to annihilate the Jews【60387791145683†L198-L214】.'
    },
    {
      category: 'Purim',
      question: 'Which biblical book is read aloud during Purim?',
      options: ['Book of Esther', 'Book of Ruth', 'Book of Genesis', 'Song of Songs'],
      answer: 'Book of Esther',
      hint: 'It tells the story of a brave queen.',
      explanation: 'The Book of Esther is read on Purim, recounting how Esther saved her people【60387791145683†L198-L214】.'
    },
    {
      category: 'Purim',
      question: 'Which triangular pastries eaten on Purim are named after the villain in the story?',
      options: ['Latkes', 'Hamantaschen', 'Rugelach', 'Kreplach'],
      answer: 'Hamantaschen',
      hint: 'They resemble a hat.',
      explanation: 'Hamantaschen are triangular cookies named after Haman’s three‑cornered hat【60387791145683†L198-L214】.'
    },
    {
      category: 'Purim',
      question: 'On Purim, people give gifts of what to friends and the poor?',
      options: ['Money', 'Food packages', 'Candles', 'Books'],
      answer: 'Food packages',
      hint: 'They are edible and often include sweets.',
      explanation: 'Mishloach manot are food gifts given to friends and the poor on Purim【60387791145683†L198-L214】.'
    },
    // Passover
    {
      category: 'Passover',
      question: 'Passover commemorates what historical event?',
      options: ['The giving of the Torah', 'The rededication of the Temple', 'The Exodus from Egypt', 'The building of the Tabernacle'],
      answer: 'The Exodus from Egypt',
      hint: 'It recalls liberation from slavery.',
      explanation: 'Passover celebrates the Exodus from Egypt and liberation from slavery【275614830834556†L174-L191】.'
    },
    {
      category: 'Passover',
      question: 'The name “Passover” refers to God doing what during the tenth plague?',
      options: ['Passing over the Red Sea', 'Passing over the Israelites’ houses', 'Passing over the Temple', 'Passing over Mount Sinai'],
      answer: 'Passing over the Israelites’ houses',
      hint: 'It spared the firstborn.',
      explanation: 'God “passed over” the homes of the Israelites marked with blood during the tenth plague, sparing their firstborn【275614830834556†L174-L191】.'
    },
    {
      category: 'Passover',
      question: 'How long does Passover last in the Diaspora?',
      options: ['Six days', 'Seven days', 'Eight days', 'Ten days'],
      answer: 'Eight days',
      hint: 'It is one day longer than in Israel.',
      explanation: 'In the diaspora, Passover is celebrated for eight days, whereas in Israel it lasts seven days【275614830834556†L174-L191】.'
    },
    {
      category: 'Passover',
      question: 'What is the ceremonial meal conducted on the first nights of Passover called?',
      options: ['Kiddush', 'Havdalah', 'Seder', 'Megillah'],
      answer: 'Seder',
      hint: 'The word means “order”.',
      explanation: 'The Passover Seder is a structured meal on the first night(s) telling the story of the Exodus【275614830834556†L174-L197】.'
    },
    {
      category: 'Passover',
      question: 'Which unleavened bread is eaten during Passover?',
      options: ['Matzah', 'Challah', 'Pita', 'Kugel'],
      answer: 'Matzah',
      hint: 'It is flat and made without leaven.',
      explanation: 'Matzah is unleavened bread eaten on Passover because the Israelites left Egypt in haste without time for dough to rise【275614830834556†L174-L191】.'
    },
    {
      category: 'Passover',
      question: 'The youngest child at the Passover Seder asks how many questions?',
      options: ['Two', 'Three', 'Four', 'Five'],
      answer: 'Four',
      hint: 'These questions begin with “Why is this night different…?”',
      explanation: 'During the Seder, the youngest child asks the Four Questions about how the night differs from all other nights【275614830834556†L193-L197】.'
    },
    {
      category: 'Passover',
      question: 'Which mixture of fruits, nuts and wine symbolises mortar on the Passover Seder plate?',
      options: ['Maror', 'Charoset', 'Chazeret', 'Karpas'],
      answer: 'Charoset',
      hint: 'It is sweet and brown.',
      explanation: 'Charoset, a sweet mixture of fruits, nuts and wine, symbolises the mortar used by Hebrew slaves in Egypt【275614830834556†L174-L191】.'
    },
    {
      category: 'Passover',
      question: 'Which bitter herb eaten at the Seder symbolises the bitterness of slavery?',
      options: ['Parsley', 'Maror', 'Horseradish', 'Charoset'],
      answer: 'Maror',
      hint: 'It makes your eyes water.',
      explanation: 'Maror (often horseradish) represents the bitterness of slavery in Egypt【275614830834556†L174-L191】.'
    },
    // Shavuot
    {
      category: 'Shavuot',
      question: 'Shavuot commemorates the giving of what at Mount Sinai?',
      options: ['The Ten Commandments', 'The Torah', 'The Ark of the Covenant', 'The Manna'],
      answer: 'The Torah',
      hint: 'It is Judaism’s central text.',
      explanation: 'Shavuot marks the giving of the Torah to the Israelites at Mount Sinai【613389210099421†L170-L179】.'
    },
    {
      category: 'Shavuot',
      question: 'Shavuot occurs how many weeks after Passover?',
      options: ['Six', 'Seven', 'Eight', 'Ten'],
      answer: 'Seven',
      hint: 'Its name means “weeks”.',
      explanation: 'Shavuot (Festival of Weeks) occurs seven weeks after Passover, culminating the counting of the Omer【613389210099421†L170-L193】.'
    },
    {
      category: 'Shavuot',
      question: 'Which biblical book is read on Shavuot?',
      options: ['Ruth', 'Esther', 'Genesis', 'Psalms'],
      answer: 'Ruth',
      hint: 'It tells the story of a Moabite woman who converts to Judaism.',
      explanation: 'The Book of Ruth is read on Shavuot, highlighting themes of loyalty and harvest【613389210099421†L180-L193】.'
    },
    {
      category: 'Shavuot',
      question: 'A common food tradition on Shavuot involves which type of product?',
      options: ['Meat', 'Dairy', 'Bread', 'Fruit'],
      answer: 'Dairy',
      hint: 'Think cheesecake.',
      explanation: 'Eating dairy foods such as cheesecake and blintzes is a Shavuot custom【613389210099421†L203-L208】.'
    },
    {
      category: 'Shavuot',
      question: 'Which overnight study session is observed by many Jews on Shavuot?',
      options: ['Tashlich', 'Tikkun Leil Shavuot', 'Yizkor', 'Kiddush'],
      answer: 'Tikkun Leil Shavuot',
      hint: 'It involves staying up all night.',
      explanation: 'Tikkun Leil Shavuot is the custom of staying awake all night studying Torah on Shavuot【613389210099421†L210-L218】.'
    },
    // Tisha B’Av
    {
      category: 'Tisha B\'Av',
      question: 'Tisha B\'Av commemorates the destruction of what?',
      options: ['The Tabernacle', 'The First and Second Temples', 'The Walls of Jericho', 'The Golden Calf'],
      answer: 'The First and Second Temples',
      hint: 'Both ancient Jewish Temples were destroyed on this day.',
      explanation: 'Tisha B\'Av mourns the destruction of both the First and Second Temples in Jerusalem【811821544113256†L44-L63】.'
    },
    {
      category: 'Tisha B\'Av',
      question: 'What scroll is read in the synagogue on Tisha B\'Av?',
      options: ['Ecclesiastes', 'Song of Songs', 'Lamentations', 'Daniel'],
      answer: 'Lamentations',
      hint: 'It laments destruction.',
      explanation: 'The Book of Lamentations is read on Tisha B\'Av to mourn the destruction of the Temple【811821544113256†L44-L63】.'
    },
    {
      category: 'Tisha B\'Av',
      question: 'On Tisha B\'Av, mourners refrain from wearing what type of footwear?',
      options: ['Leather shoes', 'Sandals', 'Sneakers', 'Boots'],
      answer: 'Leather shoes',
      hint: 'It is considered comfortable and is avoided in mourning.',
      explanation: 'On Tisha B\'Av mourners avoid wearing leather shoes as a sign of humility and mourning【811821544113256†L44-L63】.'
    },
    {
      category: 'Tisha B\'Av',
      question: 'On Tisha B\'Av, participants customarily sit on what instead of chairs?',
      options: ['Benches', 'Thrones', 'Low stools', 'Carpet'],
      answer: 'Low stools',
      hint: 'They sit lower to the ground as a sign of mourning.',
      explanation: 'It is customary to sit on low stools or the floor on Tisha B\'Av to express grief【811821544113256†L44-L63】.'
    },
    {
      category: 'Tisha B\'Av',
      question: 'Which elegiac scroll is chanted on the night of Tisha B\'Av?',
      options: ['Song of Songs', 'Lamentations', 'Ruth', 'Esther'],
      answer: 'Lamentations',
      hint: 'It is the same scroll read during the day.',
      explanation: 'On the night of Tisha B\'Av the Book of Lamentations is chanted, lamenting the destruction of Jerusalem【811821544113256†L44-L63】.'
    }
  ];

  // Shuffle the questions to randomize their order on each quiz
  const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

  let currentIndex = 0;
  let score = 0;
  let currentAttempts = 0;
  const container = document.getElementById('quiz-container');

  function renderQuestion() {
    container.innerHTML = '';
    if (currentIndex >= shuffledQuestions.length) {
      const scoreEl = document.createElement('div');
      scoreEl.className = 'quiz-score';
      scoreEl.textContent = `Quiz complete! Your score is ${score} out of ${shuffledQuestions.length}.`;
      container.appendChild(scoreEl);
      return;
    }
    const q = shuffledQuestions[currentIndex];
    const questionEl = document.createElement('div');
    questionEl.className = 'quiz-question';
    questionEl.textContent = q.question;
    container.appendChild(questionEl);
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'quiz-options';
    // Create a single feedback element to update messages
    const feedback = document.createElement('div');
    feedback.className = 'quiz-feedback';
    q.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        // Clear previous feedback
        feedback.textContent = '';
        // Compute explanation without inline citation markers
        const explanationText = q.explanation.replace(/【[^】]*】/g, '');
        if (opt === q.answer) {
          // Correct answer
          feedback.innerHTML = `<strong>Correct!</strong> ${explanationText}`;
          score++;
          if (correctSound) {
            correctSound.currentTime = 0;
            correctSound.play().catch(() => { /* ignore playback errors */ });
          }
          // Reset attempts and move to next question after a delay
          currentAttempts = 0;
          currentIndex++;
          setTimeout(renderQuestion, 3000);
        } else {
          // Incorrect answer
          if (currentAttempts === 0) {
            // First wrong attempt: show hint
            feedback.textContent = `Incorrect. Hint: ${q.hint}`;
            currentAttempts++;
          } else {
            // Second wrong attempt: show correct answer and explanation
            feedback.innerHTML = `Incorrect. The correct answer is ${q.answer}. ${explanationText}`;
            currentAttempts = 0;
            currentIndex++;
            setTimeout(renderQuestion, 4000);
          }
        }
      });
      optionsDiv.appendChild(btn);
    });
    container.appendChild(optionsDiv);
    container.appendChild(feedback);
  }

  // Start the quiz
  renderQuestion();
});