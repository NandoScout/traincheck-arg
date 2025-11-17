import axios from 'axios';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters'
import { sendServicesInfo, setSessionId, getDatesFormatted, addDate, removeDate, clearAllDates, getDates, getUserDatesFormatted, addUserDate, removeUserDate, clearAllUserDates, getUserDates, getUserConfigFormatted } from './utils';
import { addUser, userStore } from './store';
import { ORIENTATION } from './types';

// Replace 'YOUR_BOT_TOKEN' with your actual Telegram Bot API token
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_DEFAULT_CHAT_ID;

// Create a new Telegraf bot instance
export const bot = new Telegraf(TELEGRAM_BOT_TOKEN as string);

export let lastUserId = 0;

// Store the current menu level for each user
const userMenuLevels: Record<number, MenuLevel> = {};

// Store the current action state for each user (for date input)
const userActionState: Record<number, { action: string, orientation: ORIENTATION } | null> = {};


// bot.on('message',(message) => {
//     console.log('Telegram Message received:', message.text);
//     setSessionId(message.text)
// })

// bot.on('inline_query',(id, from, query, offset, chat_type, location) => {
//     console.log(query);
// })


export function sendTelegramMessage(message: string, chatId?: string | number) {
    // Send a message to the Telegram chat
    const targetChatId = chatId || TELEGRAM_CHAT_ID;
    if (bot) {
        bot.telegram.sendMessage(targetChatId as string, message);
    } else {
        const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const payload = {
          chat_id: targetChatId,
          text: message,
        };
      
        axios
          .post(telegramApiUrl, payload)
          .then(() => {
            console.log('Telegram message sent successfully.');
          })
          .catch((error) => {
            console.error('Error sending Telegram message:', error.message);
          });
    }
}

// bot.onText(/\/start/, (msg) => {
//     try {
//         bot.sendMessage(msg.chat.id, 'Bienvenido al menu principal!', mainMenu)
//         //.catch(error => console.error(error));
//     } catch (error) {
//         console.error(error);
//     }
// });

// bot.onText(new RegExp(mainMenu.reply_markup.keyboard[0][0].toString()), (msg) => {
//   bot.sendMessage(msg.chat.id, 'You selected '+msg.text)
//   .catch(error => console.error(error));
//   //   bot.sendMessage(msg.chat.id, 'You selected Main Menu Option 1');
// });

// bot.onText(new RegExp(mainMenu.reply_markup.keyboard[0][1].toString()), (msg) => {
//   bot.sendMessage(msg.chat.id, 'You selected '+msg.text);
// //   bot.sendMessage(msg.chat.id, 'You selected Main Menu Option 2');
// });

// bot.onText(new RegExp(subMenu.reply_markup.keyboard[0][0].toString()), (msg) => {
//   bot.sendMessage(msg.chat.id, 'You selected '+msg.text);
// //   bot.sendMessage(msg.chat.id, 'You selected Submenu Option 1');
// });

// bot.onText(new RegExp(subMenu.reply_markup.keyboard[0][1].toString()), (msg) => {
//   bot.sendMessage(msg.chat.id, 'You selected '+msg.text);
// //   bot.sendMessage(msg.chat.id, 'You selected Submenu Option 2');
// });

// bot.onText(new RegExp(subMenu.reply_markup.keyboard[0][2].toString()), (msg) => {
//   bot.sendMessage(msg.chat.id, 'You selected '+msg.text);
// });

// // Back to Main menu
// bot.onText(new RegExp(subMenu.reply_markup.keyboard[0].slice(-1).toString()), (msg) => {
//   bot.sendMessage(msg.chat.id, 'Back to the Main Menu!', mainMenu);
// });

// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;
//   const text = msg.text;

//   if (text === 'Open Submenu') {
//     bot.sendMessage(chatId, 'Welcome to the Submenu!', subMenu);
//   }
// });




// Define menu levels
enum MenuLevel {
  MAIN_MENU,
  SUBMENU_GO,
  SUBMENU_BACK,
  MANAGE_GO_DATES,
  MANAGE_BACK_DATES,
  // Add more menu levels as needed
}

const submenu = (level: MenuLevel) => `go_${level}`;

// Create an object to store menu options and their corresponding menus
const menus: Record<MenuLevel, any> = {
  [MenuLevel.MAIN_MENU]: {
    text: `Menu Principal\nGestione su consulta de pasajes`,
    options: [['last', 'view_config'], 'set_token', [submenu(MenuLevel.SUBMENU_GO), submenu(MenuLevel.SUBMENU_BACK)]],
    optionsText: [['Última info', 'Ver configuración'], 'Actualizar token', ['Ida', 'Vuelta']],
  },
  [MenuLevel.SUBMENU_GO]: {
    text: '**Menu Pasajes Ida**',
    options: [['view_go_dates','manage_go_dates'], submenu(MenuLevel.MAIN_MENU)],
    optionsText: [['Ver', 'Gestionar'], 'Volver'],
  },
  [MenuLevel.SUBMENU_BACK]: {
    text: '**Menu Pasajes Vuelta**',
    options: [['view_back_dates','manage_back_dates'], submenu(MenuLevel.MAIN_MENU)],
    optionsText: [['Ver', 'Gestionar'], 'Volver'],
  },
  [MenuLevel.MANAGE_GO_DATES]: {
    text: '**Gestionar Fechas de Ida**\nSeleccione una opción:',
    options: [['add_go_date', 'remove_go_date', 'clear_go_dates'], submenu(MenuLevel.SUBMENU_GO)],
    optionsText: [['Agregar', 'Eliminar', 'Borrar todas'], 'Volver'],
  },
  [MenuLevel.MANAGE_BACK_DATES]: {
    text: '**Gestionar Fechas de Vuelta**\nSeleccione una opción:',
    options: [['add_back_date', 'remove_back_date', 'clear_back_dates'], submenu(MenuLevel.SUBMENU_BACK)],
    optionsText: [['Agregar', 'Eliminar', 'Borrar todas'], 'Volver'],
  },
  // Add more menu levels and options as needed
};

// Middleware for /start command
bot.start((ctx) => {
  const chatId = ctx.message.chat.id;

  // Initialize the user's menu level to the main menu
  userMenuLevels[chatId] = MenuLevel.MAIN_MENU;

  // Display the main menu
  showMenu(ctx);
});
// Middleware for /menu command
bot.command('menu',(ctx) => {
  const chatId = ctx.message.chat.id;

  // Initialize the user's menu level to the main menu
  userMenuLevels[chatId] = MenuLevel.MAIN_MENU;

  // Display the main menu
  showMenu(ctx);
});

const cmdLast = (ctx: any) => {
  const chatId = ctx.message?.chat?.id || ctx.chat.id;

  sendServicesInfo(userStore[chatId]?.lastInfo, `Ultima info:\n`, '', true)
}

// Middleware for /last command
bot.command('last',(ctx) => {
  cmdLast(ctx)
});

bot.command('token', async (ctx) => {
    if (ctx.payload?.length) {
        lastUserId = ctx.chat.id
        console.log('Chat:',ctx.chat.id,'Token recibido:',ctx.payload);
        setSessionId(ctx.payload)
        .then(t => {
          if (!userStore[lastUserId]) { addUser({id: lastUserId, token: t as string }) }
          ctx.reply(`Token guardado`)
        })
        .catch(error => 
            ctx.reply(error.toString() || 'Token invalido')
        )
    }
})

bot.command('quit', async (ctx) => {
  // Explicit usage
//   await ctx.telegram.leaveChat(ctx.message.chat.id)

  // Using context shortcut
  ctx.leaveChat()
  .then(t => console.log('Chat finalizado con '+(ctx.chat as any).first_name))
  .catch(error => ctx.reply(error.toString()))
})

// Middleware for handling text messages
// bot.on('text', (ctx) => {
//   const chatId = ctx.message.chat.id;
//   const text = ctx.message.text;

//   // Get the user's current menu level
//   const currentMenuLevel = userMenuLevels[chatId];

//   // Handle user input based on the current menu level
//   switch (currentMenuLevel) {
//     case MenuLevel.MAIN_MENU:
//       handleMainMenuInput(chatId, ctx, text);
//       break;
//     case MenuLevel.SUBMENU_1:
//       handleSubmenu1Input(chatId, ctx, text);
//       break;
//     case MenuLevel.SUBMENU_2:
//       handleSubmenu2Input(chatId, ctx, text);
//       break;
//     // Add more cases for additional menu levels
//   }
// });

// Helper function to display the current menu for a user
function showMenu(ctx) {
  const chatId = ctx.chat?.id || 0;
  const currentMenuLevel = userMenuLevels[chatId];
  const menu = menus[currentMenuLevel];

  if (menu) {
    const keyboard = {
        parse_mode: 'HTML',
        reply_markup: {
            remove_keyboard: true,
            inline_keyboard: menu.options
            .map((o1,idx1) => (Array.isArray(o1) ? o1 : [o1])
              .map((o2,idx2) => {
                let optionText = (menu.optionsText) ? (Array.isArray(o1) ? menu.optionsText[idx1][idx2] : menu.optionsText[idx1]) : o2;
                if (!optionText && typeof o2 === 'string') optionText = o2;
                return typeof o2=== 'object' ? o2 : {text: optionText, callback_data: o2} 
              }
              )
            ),
            resize_keyboard: true,
            one_time_keyboard: false,
        }
    };

    if (ctx.callbackQuery) {
        ctx.editMessageText(menu.text, keyboard)
        .catch(error => ctx.reply(error.toString()))
        // ctx.editMessageReplyMarkup(keyboard.reply_markup);
        // ctx.answerCbQuery(menu.text, keyboard);
    } else {
        ctx.reply(menu.text, keyboard)
        .catch(error => ctx.reply(error.toString()))
    }
  }
}

// Helper functions to handle user input for each menu level
function handleMenuNavigation(ctx) {
    const chatId = ctx.chat?.id || 0;
    const option = ctx.callbackQuery.data.split('_')
    if (option[0] === 'go') {
        const level = parseInt(option[1], 10);
        if (!isNaN(level) && level in MenuLevel) {
            userMenuLevels[chatId] = level as MenuLevel;
            showMenu(ctx);
            return true;
        }
    }
    return false;
}
function handleMainMenuInput(ctx) {
    const chatId = ctx.chat?.id || 0;
    const option = ctx.callbackQuery;
    // Handle other options in the main menu
    switch (option.data) {
      case 'last':
        cmdLast(ctx)
        break;
      case 'view_config':
        const config = getUserConfigFormatted(chatId);
        ctx.reply(config, { parse_mode: 'Markdown' })
          .catch(error => ctx.reply(error.toString()));
        break;
    
      default:
        ctx.answerCbQuery(`You selected: ${option.data}`)
        .catch(error => ctx.reply(error.toString()))
        break;
    }
}

function handleSubmenu1Input(ctx) {
    const chatId = ctx.chat?.id || 0;
    const option = ctx.callbackQuery;
    // Handle options in submenu GO (Ida)
    switch (option.data) {
      case 'view_go_dates':
        const goDates = getUserDatesFormatted(chatId, ORIENTATION.GO);
        ctx.reply(goDates)
          .catch(error => ctx.reply(error.toString()));
        break;
      case 'manage_go_dates':
        userMenuLevels[chatId] = MenuLevel.MANAGE_GO_DATES;
        showMenu(ctx);
        break;
      default:
        ctx.answerCbQuery(`You selected: ${option.data}`)
          .catch(error => ctx.reply(error.toString()));
        break;
    }
}

function handleSubmenu2Input(ctx) {
    const chatId = ctx.chat?.id || 0;
    const option = ctx.callbackQuery;
    // Handle options in submenu BACK (Vuelta)
    switch (option.data) {
      case 'view_back_dates':
        const backDates = getUserDatesFormatted(chatId, ORIENTATION.BACK);
        ctx.reply(backDates)
          .catch(error => ctx.reply(error.toString()));
        break;
      case 'manage_back_dates':
        userMenuLevels[chatId] = MenuLevel.MANAGE_BACK_DATES;
        showMenu(ctx);
        break;
      default:
        ctx.answerCbQuery(`You selected: ${option.data}`)
          .catch(error => ctx.reply(error.toString()));
        break;
    }
}

function handleManageGoDatesInput(ctx) {
    const chatId = ctx.chat?.id || 0;
    const option = ctx.callbackQuery;
    
    switch (option.data) {
      case 'add_go_date':
        userActionState[chatId] = { action: 'add', orientation: ORIENTATION.GO };
        ctx.reply('Por favor, envíe la fecha en formato DD/MM/YYYY o DD/MM (ejemplo: 24/11/2025 o 24/11)')
          .catch(error => ctx.reply(error.toString()));
        break;
      case 'remove_go_date':
        const goDatesList = getUserDates(chatId, ORIENTATION.GO);
        if (goDatesList.length === 0) {
          ctx.reply('No hay fechas de ida para eliminar.')
            .catch(error => ctx.reply(error.toString()));
        } else {
          userActionState[chatId] = { action: 'remove', orientation: ORIENTATION.GO };
          ctx.reply(`Fechas actuales:\n${goDatesList.map((d, i) => `${i + 1}. ${d}`).join('\n')}\n\nPor favor, envíe la fecha que desea eliminar (formato: DD/MM/YYYY o DD/MM)`)
            .catch(error => ctx.reply(error.toString()));
        }
        break;
      case 'clear_go_dates':
        clearAllUserDates(chatId, ORIENTATION.GO);
        ctx.reply('Todas las fechas de ida han sido eliminadas.')
          .catch(error => ctx.reply(error.toString()));
        userMenuLevels[chatId] = MenuLevel.SUBMENU_GO;
        showMenu(ctx);
        break;
      default:
        ctx.answerCbQuery(`You selected: ${option.data}`)
          .catch(error => ctx.reply(error.toString()));
        break;
    }
}

function handleManageBackDatesInput(ctx) {
    const chatId = ctx.chat?.id || 0;
    const option = ctx.callbackQuery;
    
    switch (option.data) {
      case 'add_back_date':
        userActionState[chatId] = { action: 'add', orientation: ORIENTATION.BACK };
        ctx.reply('Por favor, envíe la fecha en formato DD/MM/YYYY o DD/MM (ejemplo: 24/11/2025 o 24/11)')
          .catch(error => ctx.reply(error.toString()));
        break;
      case 'remove_back_date':
        const backDatesList = getUserDates(chatId, ORIENTATION.BACK);
        if (backDatesList.length === 0) {
          ctx.reply('No hay fechas de vuelta para eliminar.')
            .catch(error => ctx.reply(error.toString()));
        } else {
          userActionState[chatId] = { action: 'remove', orientation: ORIENTATION.BACK };
          ctx.reply(`Fechas actuales:\n${backDatesList.map((d, i) => `${i + 1}. ${d}`).join('\n')}\n\nPor favor, envíe la fecha que desea eliminar (formato: DD/MM/YYYY o DD/MM)`)
            .catch(error => ctx.reply(error.toString()));
        }
        break;
      case 'clear_back_dates':
        clearAllUserDates(chatId, ORIENTATION.BACK);
        ctx.reply('Todas las fechas de vuelta han sido eliminadas.')
          .catch(error => ctx.reply(error.toString()));
        userMenuLevels[chatId] = MenuLevel.SUBMENU_BACK;
        showMenu(ctx);
        break;
      default:
        ctx.answerCbQuery(`You selected: ${option.data}`)
          .catch(error => ctx.reply(error.toString()));
        break;
    }
}

bot.on(message('text'), async (ctx) => {
  const chatId = ctx.message.chat.id;
  const text = ctx.message.text;
  
  // Check if user is in an action state (adding or removing dates)
  const actionState = userActionState[chatId];
  if (actionState) {
    const { action, orientation } = actionState;
    
    if (action === 'add') {
      const success = addUserDate(chatId, orientation, text);
      if (success) {
        // Obtener la fecha final (puede haber sido completada con el año)
        const dates = getUserDates(chatId, orientation);
        const addedDate = dates[dates.length - 1];
        ctx.reply(`Fecha ${addedDate} agregada correctamente.`)
          .catch(error => ctx.reply(error.toString()));
        userActionState[chatId] = null;
        // Volver al menú de gestión
        userMenuLevels[chatId] = orientation === ORIENTATION.GO 
          ? MenuLevel.MANAGE_GO_DATES 
          : MenuLevel.MANAGE_BACK_DATES;
        showMenu(ctx);
      } else {
        ctx.reply('Error: La fecha no es válida o ya existe. Use el formato DD/MM/YYYY o DD/MM (ejemplo: 24/11/2025 o 24/11)')
          .catch(error => ctx.reply(error.toString()));
      }
    } else if (action === 'remove') {
      const success = removeUserDate(chatId, orientation, text);
      if (success) {
        ctx.reply(`Fecha ${text} eliminada correctamente.`)
          .catch(error => ctx.reply(error.toString()));
        userActionState[chatId] = null;
        // Volver al menú de gestión
        userMenuLevels[chatId] = orientation === ORIENTATION.GO 
          ? MenuLevel.MANAGE_GO_DATES 
          : MenuLevel.MANAGE_BACK_DATES;
        showMenu(ctx);
      } else {
        ctx.reply('Error: La fecha no existe en la lista.')
          .catch(error => ctx.reply(error.toString()));
      }
    }
  } else {
    // Default behavior for text messages
    ctx.reply(`Hello ${(ctx?.chat as any)?.first_name}`)
      .catch(error => ctx.reply(error.toString()));
  }
})

bot.on('callback_query', async (ctx) => {
  // Explicit usage
//   await ctx.telegram.answerCbQuery(ctx.callbackQuery.id)
  
  const chatId = ctx.chat?.id || 0;

  // Get the user's current menu level
  const currentMenuLevel = userMenuLevels[chatId];

  // Handle user input based on the current menu level
  if (!handleMenuNavigation(ctx)) {
      switch (currentMenuLevel) {
        case MenuLevel.MAIN_MENU:
          handleMainMenuInput(ctx);
          break;
        case MenuLevel.SUBMENU_GO:
          handleSubmenu1Input(ctx);
          break;
        case MenuLevel.SUBMENU_BACK:
          handleSubmenu2Input(ctx);
          break;
        case MenuLevel.MANAGE_GO_DATES:
          handleManageGoDatesInput(ctx);
          break;
        case MenuLevel.MANAGE_BACK_DATES:
          handleManageBackDatesInput(ctx);
          break;
        // Add more cases for additional menu levels
      }
  }

  // Using context shortcut
  ctx.answerCbQuery()
  .catch(error => ctx.reply(error.toString()))
})

bot.on('inline_query', async (ctx) => {
  const result = []
  // Explicit usage
//   await ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result)

  // Using context shortcut
  ctx.answerInlineQuery(result)
  .catch(error => ctx.reply(error.toString()))
})
// Start the bot
bot.launch().then(() => {
  console.log('Bot is running');
});
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default bot;