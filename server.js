const TelegramBot = require('node-telegram-bot-api');
const { token, id } = require('./data');

const bot = new TelegramBot(token, { polling: true });

// Time zones configuration
const timeZones = {
  'UTC': 'UTC',
  'US/Eastern': 'America/New_York',
  'US/Central': 'America/Chicago',
  'US/Mountain': 'America/Denver',
  'US/Pacific': 'America/Los_Angeles',
  'Europe/London': 'Europe/London',
  'Europe/Paris': 'Europe/Paris',
  'Europe/Cairo': 'Africa/Cairo',
  'Asia/Dubai': 'Asia/Dubai',
  'Asia/Bangkok': 'Asia/Bangkok',
  'Asia/Tokyo': 'Asia/Tokyo',
  'Australia/Sydney': 'Australia/Sydney',
  'Pacific/Auckland': 'Pacific/Auckland'
};

// Get current time in a specific timezone
function getTimeInTimezone(timezone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(new Date());
  const timeParts = {};
  
  parts.forEach(part => {
    timeParts[part.type] = part.value;
  });
  
  return {
    date: `${timeParts.year}-${timeParts.month}-${timeParts.day}`,
    time: `${timeParts.hour}:${timeParts.minute}:${timeParts.second}`
  };
}

// Generate timezone buttons
function getTimezoneButtons() {
  const buttons = [];
  const timezoneArray = Object.entries(timeZones);
  
  for (let i = 0; i < timezoneArray.length; i += 2) {
    const row = [];
    row.push({ text: timezoneArray[i][0], callback_data: `tz_${timezoneArray[i][1]}` });
    if (i + 1 < timezoneArray.length) {
      row.push({ text: timezoneArray[i + 1][0], callback_data: `tz_${timezoneArray[i + 1][1]}` });
    }
    buttons.push(row);
  }
  
  return buttons;
}

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
⏰ *Digital Clock - Multi Timezone*

Select a timezone to view the current time:
  `;
  
  bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: getTimezoneButtons()
    }
  });
});

// Help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
📖 *Available Commands:*

/start - Show timezone selection
/help - Display this help message
/all - Show time in all timezones
/update - Get live clock (updates every second)

Simply click any timezone button to see the current time.
  `;
  
  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Show all timezones
bot.onText(/\/all/, (msg) => {
  const chatId = msg.chat.id;
  let allTimesMessage = '🌍 *Current Time in All Timezones:*
\n';
  
  Object.entries(timeZones).forEach(([name, tz]) => {
    const { time } = getTimeInTimezone(tz);
    allTimesMessage += `🕐 *${name}*: ${time}\n`;
  });
  
  bot.sendMessage(chatId, allTimesMessage, { parse_mode: 'Markdown' });
});

// Update/Live clock command
bot.onText(/\/update/, (msg) => {
  const chatId = msg.chat.id;
  
  const sendClock = () => {
    let clockMessage = '⏱️ *Live Digital Clock*\n\n';
    
    Object.entries(timeZones).forEach(([name, tz]) => {
      const { date, time } = getTimeInTimezone(tz);
      clockMessage += `🕐 *${name}*\n   ${date} ${time}\n\n`;
    });
    
    bot.sendMessage(chatId, clockMessage, { parse_mode: 'Markdown' });
  };  
  
  sendClock();
  bot.sendMessage(chatId, '_Clock updates every 60 seconds..._', { parse_mode: 'Markdown' });
  
  const clockInterval = setInterval(() => {
    sendClock();
  }, 60000);
  
  // Stop after 5 minutes
  setTimeout(() => {
    clearInterval(clockInterval);
    bot.sendMessage(chatId, '⏹️ Live clock stopped.', { parse_mode: 'Markdown' });
  }, 300000);
});

// Handle timezone button clicks
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  
  if (data.startsWith('tz_')) {
    const timezone = data.substring(3);
    const { date, time } = getTimeInTimezone(timezone);
    
    // Find timezone name
    let tzName = '';
    Object.entries(timeZones).forEach(([name, tz]) => {
      if (tz === timezone) {
        tzName = name;
      }
    });
    
    const clockMessage = `
⏰ *Digital Clock*

🕐 *${tzName}*
📅 Date: ${date}
🕒 Time: ${time}

Select another timezone:
    `;
    
    bot.editMessageText(clockMessage, {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: getTimezoneButtons()
      }
    });
  }
  
  bot.answerCallbackQuery(query.id);
});

// Handle any other messages
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  
  if (msg.text && !msg.text.startsWith('/')) {
    const { date, time } = getTimeInTimezone('UTC');
    bot.sendMessage(chatId, `
⏰ *Current UTC Time*
📅 ${date}
🕒 ${time}

Use /start to select different timezones or /help for more commands.
    `, { parse_mode: 'Markdown' });
  }
});

console.log('🤖 Digital Clock Bot is running...');